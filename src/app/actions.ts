"use server";

import * as z from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";

const createPollSchema = z.object({
  question: z.string().min(5).max(200),
  options: z.string().min(1),
});

export async function createPoll(values: z.infer<typeof createPollSchema>) {
  const validatedFields = createPollSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields." };
  }

  const { question, options: optionsString } = validatedFields.data;

  const optionsList = optionsString.split("\n").map(opt => opt.trim()).filter(opt => opt !== "");
  
  if (optionsList.length < 2) {
    return { success: false, error: "At least two options are required." };
  }

  const options = optionsList.reduce((acc, option) => {
    acc[option] = 0;
    return acc;
  }, {} as Record<string, number>);

  try {
    const pollRef = await adminDb.collection("polls").add({
      question,
      options,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, pollId: pollRef.id };
  } catch (error) {
    console.error("Error creating poll:", error);
    if (error instanceof Error && error.message.includes('The default Firebase app does not exist')) {
        return { success: false, error: "Firebase Admin SDK not initialized. Please check your service account credentials in .env.local and restart the server." };
    }
    return { success: false, error: "Could not create poll in the database. Check server logs for details." };
  }
}

const castVoteSchema = z.object({
  pollId: z.string(),
  option: z.string(),
  visitorId: z.string().min(10),
});

export async function castVote(values: z.infer<typeof castVoteSchema>) {
  const validatedFields = castVoteSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid input." };
  }

  const { pollId, option, visitorId } = validatedFields.data;

  const pollRef = adminDb.collection("polls").doc(pollId);
  const voterRef = pollRef.collection("voters").doc(visitorId);

  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists) {
        throw new Error("Poll does not exist.");
      }

      const pollData = pollDoc.data();
      if (!pollData || !pollData.options || !(option in pollData.options)) {
        throw new Error("Invalid option for this poll.");
      }
      
      const voterDoc = await transaction.get(voterRef);
      if (voterDoc.exists) {
        return { success: false, message: "You have already voted on this poll." };
      }

      transaction.update(pollRef, {
        [`options.${option}`]: FieldValue.increment(1),
      });

      transaction.set(voterRef, {
        votedAt: FieldValue.serverTimestamp(),
        option: option,
      });

      return { success: true, message: "Your vote has been cast!" };
    });

    return result;

  } catch (error) {
    console.error("Error casting vote:", error);
    if (error instanceof Error) {
        if (error.message.includes('The default Firebase app does not exist')) {
            return { success: false, message: "Firebase Admin SDK not initialized. Please check your service account credentials and restart the server." };
        }
        return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPoll } from "./actions";
import { suggestOptions } from "@/ai/flows/suggest-options-flow";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters long.").max(200),
  options: z.string().min(1, "You must provide at least one option.").refine(
    (value) => {
      const options = value.split("\n").filter(opt => opt.trim() !== "");
      return options.length >= 2;
    },
    { message: "Please provide at least two options, each on a new line." }
  ),
});

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      options: "",
    },
  });

  async function handleSuggestOptions() {
    const question = form.getValues("question");
    if (!question || question.length < 5) {
      toast({
        variant: "destructive",
        title: "Please enter a valid question first.",
        description: "Your question must be at least 5 characters long.",
      });
      return;
    }
    
    setIsSuggesting(true);
    try {
      const result = await suggestOptions({ question });
      if (result.options) {
        form.setValue("options", result.options, { shouldValidate: true });
        toast({
          title: "Suggestions added!",
          description: "AI-powered options have been filled in for you.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not generate suggestions at this time.",
      });
    } finally {
      setIsSuggesting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createPoll(values);
      if (result.success && result.pollId) {
        toast({
          title: "Success!",
          description: "Your poll has been created.",
        });
        router.push(`/poll/${result.pollId}`);
      } else {
        throw new Error(result.error || "Failed to create poll.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error instanceof Error ? error.message : "There was a problem with your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Create a New Poll</CardTitle>
            <CardDescription>Enter your question and options below. One vote per device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Poll Question</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., What's for lunch?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-lg">Options</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSuggestOptions}
                          disabled={isSubmitting || isSuggesting}
                        >
                          {isSuggesting ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-accent" />
                          )}
                          <span className="ml-2">Suggest with AI</span>
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Pizza\nBurgers\nSalad"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each option on a new line.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                  {isSubmitting ? (
                    <>
                      <Spinner /> <span className="ml-2">Creating Poll...</span>
                    </>
                  ) : (
                    "Create Poll"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

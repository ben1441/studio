
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { db } from "@/lib/firebase/config";
import { castVote } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Poll {
  question: string;
  options: Record<string, number>;
}

const chartConfig = {
  votes: {
    label: "Votes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function PollPage() {
  const { pollId } = useParams() as { pollId: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [votingOn, setVotingOn] = useState<string | null>(null);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  useEffect(() => {
    const storedVotedOption = localStorage.getItem(`voted_poll_${pollId}`);
    if (storedVotedOption) {
      setVotedOption(storedVotedOption);
    }
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;
    
    const docRef = doc(db, "polls", pollId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Poll;
        setPoll({ ...data, options: data.options || {} });
        setError(null);
      } else {
        setError("Poll not found. It might have been deleted.");
        setPoll(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching poll:", err);
      setError("Failed to load poll data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pollId]);

  const totalVotes = useMemo(() => {
    if (!poll?.options) return 0;
    return Object.values(poll.options).reduce((sum, count) => sum + count, 0);
  }, [poll]);

  const chartData = useMemo(() => {
    if (!poll?.options) return [];
    return Object.entries(poll.options).map(([option, votes]) => ({
      option,
      votes,
    })).sort((a, b) => b.votes - a.votes);
  }, [poll]);

  const handleVote = async (option: string) => {
    if (votedOption) return;
    
    setIsVoting(true);
    setVotingOn(option);
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      const voteResult = await castVote({ pollId, option, visitorId });

      if (voteResult.success) {
        toast({
          title: "Success!",
          description: "Your vote has been cast!",
        });
        setVotedOption(option);
        localStorage.setItem(`voted_poll_${pollId}`, option);
      } else {
        toast({
          variant: "destructive",
          title: "Vote Failed",
          description: voteResult.error,
        });
        if (voteResult.error?.includes("already voted")) {
          setVotedOption('true'); // Generic flag to disable voting
          localStorage.setItem(`voted_poll_${pollId}`, 'true'); 
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not cast your vote due to an unexpected error.",
      });
    } finally {
      setIsVoting(false);
      setVotingOn(null);
    }
  };

  const hasVoted = !!votedOption;
  const votedForSpecificOption = hasVoted && poll?.options && poll.options.hasOwnProperty(votedOption);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/')} variant="link" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to create a poll
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Button onClick={() => router.push('/')} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Create Another Poll
        </Button>
        {poll && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-4xl">{poll.question}</CardTitle>
              <CardDescription>
                {totalVotes} vote{totalVotes !== 1 && 's'} cast so far.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalVotes > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 0, right: 30 }}
                  >
                    <YAxis
                      dataKey="option"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      className="text-sm truncate"
                      width={120}
                    />
                    <XAxis dataKey="votes" type="number" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="votes" fill="var(--color-votes)" radius={5} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No votes cast yet. Be the first!
                </div>
              )}
            </CardContent>
            {poll.options && Object.keys(poll.options).length > 0 && (
              <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <div className="w-full">
                    <h3 className="text-lg font-medium mb-4">
                        {hasVoted ? "You've Voted" : "Cast your vote"}
                    </h3>
                    {hasVoted ? (
                        <Alert variant="default">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>
                                {votedForSpecificOption
                                    ? `Thanks for voting for "${votedOption}"!`
                                    : "Your vote has been recorded."
                                }
                            </AlertTitle>
                            <AlertDescription>
                                You can only vote once per device.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-2">
                            {Object.keys(poll.options).map((option) => (
                                <Button
                                    key={option}
                                    variant="outline"
                                    className="w-full justify-start text-base py-6"
                                    onClick={() => handleVote(option)}
                                    disabled={isVoting}
                                >
                                    {isVoting && votingOn === option && <Spinner className="mr-2 h-4 w-4" />}
                                    {option}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

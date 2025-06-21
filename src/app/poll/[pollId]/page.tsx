"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { db } from "@/lib/firebase/config";
import { castVote } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface Poll {
  question: string;
  options: Record<string, number>;
}

export default function PollPage() {
  const { pollId } = useParams() as { pollId: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
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
        setPoll(docSnap.data() as Poll);
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
    if (!poll) return 0;
    return Object.values(poll.options).reduce((sum, count) => sum + count, 0);
  }, [poll]);

  const handleVote = async (option: string) => {
    if (votedOption) return;
    
    setIsVoting(true);
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
        // If server says we already voted, update local state
        if (voteResult.error?.includes("already voted")) {
          setVotedOption(option); // We don't know which option, but we can lock voting. Let's assume current option for UI feedback
          localStorage.setItem(`voted_poll_${pollId}`, 'true'); // Generic flag
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
    }
  };

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
                {votedOption && " You have already voted."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(poll.options).map(([option, votes]) => {
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const isThisVotedOption = votedOption === option;

                return (
                  <Button
                    key={option}
                    variant={isThisVotedOption ? "default" : "outline"}
                    className="w-full h-auto p-4 justify-between text-base flex-col sm:flex-row items-start sm:items-center relative overflow-hidden"
                    onClick={() => handleVote(option)}
                    disabled={isVoting || !!votedOption}
                  >
                    <div className="absolute top-0 left-0 h-full bg-primary/20" style={{ width: `${percentage}%` }}/>
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="font-medium text-left">{option}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">{votes}</span>
                        {isThisVotedOption && <CheckCircle2 className="h-5 w-5 text-primary-foreground" />}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPollById, submitVote } from "@/app/lib/actions/poll-actions";
import { getCurrentUser } from "@/app/lib/actions/auth-actions";
import SharePoll from "../SharePoll";
import { toast } from "sonner";

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPollAndUser = async () => {
      const { poll } = await getPollById(params.id);
      const user = await getCurrentUser();
      setPoll(poll);
      setUser(user);
    };
    fetchPollAndUser();
  }, [params.id]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);
    const { error } = await submitVote(params.id, selectedOption);
    if (error) {
      toast.error(error);
    } else {
      setHasVoted(true);
      toast.success("Vote submitted successfully!");
    }
    setIsSubmitting(false);
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  if (!poll) {
    return <div>Loading...</div>;
  }

  const isOwner = user && user.id === poll.user_id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        {isOwner && (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
            </Button>
            <Button variant="outline" className="text-red-500 hover:text-red-700">
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedOption === index
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedOption(index)}
                >
                  {option}
                </div>
              ))}
              <Button
                onClick={handleVote}
                disabled={selectedOption === null || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              {poll.options.map((option: string, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option}</span>
                    <span>
                      {getPercentage(poll.votes[index] || 0)}% (
                      {poll.votes[index] || 0} votes)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${getPercentage(poll.votes[index] || 0)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {poll.totalVotes}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      <div className="pt-4">
        <SharePoll pollId={params.id} pollTitle={poll.question} />
      </div>
    </div>
  );
}

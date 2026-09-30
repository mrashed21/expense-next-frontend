"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAdminFeedbacksQuery,
  useMarkFeedbackReviewedMutation,
  useReplyToFeedbackMutation,
} from "@/services/feedback-api";
import { CheckCircle2, Loader2, MessageSquare, Reply } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminFeedbacksPage() {
  const {
    data: feedbackResponse,
    isLoading,
    refetch,
  } = useGetAdminFeedbacksQuery({});
  const [markReviewed, { isLoading: isMarking }] =
    useMarkFeedbackReviewedMutation();
  const [replyToFeedback, { isLoading: isReplying }] =
    useReplyToFeedbackMutation();

  const [replyMessage, setReplyMessage] = useState("");
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const feedbacks = feedbackResponse?.data || [];

  const handleMarkReviewed = async (id: string) => {
    try {
      await markReviewed(id).unwrap();
      toast.success("Feedback marked as reviewed");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as reviewed");
    }
  };

  const handleReply = async () => {
    if (!activeFeedbackId || !replyMessage) return;
    try {
      await replyToFeedback({
        id: activeFeedbackId,
        admin_reply: replyMessage,
      }).unwrap();
      toast.success("Reply sent and feedback marked as reviewed");
      setReplyMessage("");
      setActiveFeedbackId(null);
      setIsReplyModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send reply");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-primary" />
          User Feedbacks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and respond to feedback submitted by users.
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No feedbacks available yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((fb: any) => (
            <Card
              key={fb._id}
              className="flex flex-col h-full border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base font-bold line-clamp-2">
                      {fb.subject}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      By:{" "}
                      <span className="font-semibold text-foreground">
                        {fb.user_id?.user_name}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={fb.status === "reviewed" ? "secondary" : "default"}
                    className="capitalize shrink-0"
                  >
                    {fb.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div className="flex-1 mb-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                    {fb.message}
                  </p>
                  {fb.admin_reply && (
                    <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                      <p className="text-xs font-semibold mb-1 text-primary">
                        Your Reply:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fb.admin_reply}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-2">
                  {fb.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center gap-2"
                        onClick={() => {
                          setActiveFeedbackId(fb._id);
                          setReplyMessage("");
                          setIsReplyModalOpen(true);
                        }}
                      >
                        <Reply className="w-4 h-4" />
                        Reply
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleMarkReviewed(fb._id)}
                        disabled={isMarking}
                      >
                        {isMarking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Mark Done
                      </Button>
                    </>
                  ) : (
                    <div className="w-full text-center text-xs font-medium text-emerald-500 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                      Reviewed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Feedback</DialogTitle>
            <DialogDescription>
              Your reply will be sent to the user as a notification.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your reply here..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={isReplying || !replyMessage}
            >
              {isReplying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

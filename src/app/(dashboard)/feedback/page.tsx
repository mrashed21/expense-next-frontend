"use client";

import { CardSkeleton } from "@/components/custom/card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteFeedbackMutation,
  useGetMyFeedbacksQuery,
  useSubmitFeedbackMutation,
} from "@/services/feedback-api";
import {
  useDeleteReviewMutation,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
} from "@/services/review-api";
import { Loader2, MessageSquare, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const [submitFeedback, { isLoading: isSubmittingFeedback }] =
    useSubmitFeedbackMutation();
  const [submitReview, { isLoading: isSubmittingReview }] =
    useSubmitReviewMutation();

  const { data: feedbackData, isLoading: isLoadingFeedbacks } =
    useGetMyFeedbacksQuery({});
  const { data: reviewData, isLoading: isLoadingReviews } =
    useGetMyReviewsQuery({});

  const [deleteFeedback, { isLoading: isDeletingFeedback }] =
    useDeleteFeedbackMutation();
  const [deleteReview, { isLoading: isDeletingReview }] =
    useDeleteReviewMutation();

  const myFeedbacks = feedbackData?.data || [];
  const myReviews = reviewData?.data || [];

  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitFeedback({
        subject: feedbackSubject,
        message: feedbackMessage,
      }).unwrap();
      toast.success("Feedback submitted successfully. Thank you!");
      setFeedbackSubject("");
      setFeedbackMessage("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit feedback");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReview({
        rating: reviewRating,
        comment: reviewComment,
      }).unwrap();
      toast.success("Review submitted successfully. Thank you!");
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/20">
        <div>
          <h1 className="text-xl sm:text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-8 h-8" /> Feedback & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Share your experience with us or report an issue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Review Form */}
        <Card className="p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Leave a Review
            </h2>
            <p className="text-xs text-muted-foreground">
              Rate your experience with our application.
            </p>
          </div>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment</Label>
              <Textarea
                id="review-comment"
                placeholder="Tell us what you think..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={4}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmittingReview || !reviewComment}
              className="w-full"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </Card>

        {/* Feedback Form */}
        <Card className="p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Send Feedback
            </h2>
            <p className="text-xs text-muted-foreground">
              Report bugs, suggest features, or ask for help.
            </p>
          </div>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-subject">Subject</Label>
              <Input
                id="feedback-subject"
                placeholder="e.g. Bug report, Feature request"
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Describe your feedback in detail..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                required
                rows={4}
              />
            </div>
            <Button
              type="submit"
              disabled={
                isSubmittingFeedback || !feedbackSubject || !feedbackMessage
              }
              className="w-full"
              variant="outline"
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </form>
        </Card>
      </div>

      {/* My Submissions Section */}
      <div className="mt-10 space-y-6 pt-8 border-t border-border">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            My Submissions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your past feedbacks and reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feedbacks List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">My Feedbacks</h3>
            {isLoadingFeedbacks ? (
              <div className="space-y-4">
                <CardSkeleton count={2} />
              </div>
            ) : myFeedbacks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No feedbacks submitted yet.
              </p>
            ) : (
              myFeedbacks.map((fb: any) => (
                <Card
                  key={fb._id}
                  className="p-4 border border-border shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{fb.subject}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          fb.status === "reviewed" ? "secondary" : "outline"
                        }
                        className="capitalize"
                      >
                        {fb.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={async () => {
                          try {
                            await deleteFeedback(fb._id).unwrap();
                            toast.success("Feedback deleted");
                          } catch (err: any) {
                            toast.error("Failed to delete");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {fb.message}
                  </p>
                  {fb.admin_reply && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border/50">
                      <p className="text-xs font-semibold mb-1 text-primary">
                        Admin Reply:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fb.admin_reply}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">My Reviews</h3>
            {isLoadingReviews ? (
              <div className="space-y-4">
                <CardSkeleton count={2} />
              </div>
            ) : myReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews submitted yet.
              </p>
            ) : (
              myReviews.map((rev: any) => (
                <Card
                  key={rev._id}
                  className="p-4 border border-border shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={async () => {
                        try {
                          await deleteReview(rev._id).unwrap();
                          toast.success("Review deleted");
                        } catch (err: any) {
                          toast.error("Failed to delete");
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                    {rev.comment}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useAdminDeleteReviewMutation,
  useApproveReviewMutation,
  useGetAdminReviewsQuery,
  useRejectReviewMutation,
} from "@/services/review-api";
import { CheckCircle2, Loader2, Star, Trash2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const {
    data: reviewsResponse,
    isLoading,
    refetch,
  } = useGetAdminReviewsQuery({});
  const [approveReview, { isLoading: isApproving }] =
    useApproveReviewMutation();
  const [rejectReview, { isLoading: isRejecting }] = useRejectReviewMutation();
  const [adminDeleteReview, { isLoading: isDeleting }] =
    useAdminDeleteReviewMutation();

  const reviews = reviewsResponse?.data || [];

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id).unwrap();
      toast.success("Review approved — now visible on landing page");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectReview(id).unwrap();
      toast.success("Review hidden from landing page");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?"))
      return;
    try {
      await adminDeleteReview(id).unwrap();
      toast.success("Review permanently deleted");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const approved = reviews.filter((r: any) => r.is_approved);
  const pending = reviews.filter((r: any) => !r.is_approved);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Star className="w-7 h-7 text-primary" />
          User Reviews Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve or reject reviews. Only approved reviews appear on the landing
          page.
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-muted-foreground">
            Total:{" "}
            <span className="font-bold text-foreground">{reviews.length}</span>
          </span>
          <span className="text-muted-foreground">
            Approved:{" "}
            <span className="font-bold text-green-500">{approved.length}</span>
          </span>
          <span className="text-muted-foreground">
            Hidden:{" "}
            <span className="font-bold text-red-500">{pending.length}</span>
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No reviews submitted yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev: any) => (
            <Card
              key={rev._id}
              className={`flex flex-col h-full border shadow-sm transition-all hover:shadow-md ${
                rev.is_approved
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
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
                    {/* User info */}
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {rev.user_id?.user_name || "Unknown"}
                      </span>
                      {rev.user_id?.user_email && (
                        <span className="ml-1 truncate">
                          · {rev.user_id.user_email}
                        </span>
                      )}
                    </div>
                    {/* Status badge */}
                    <Badge
                      variant={rev.is_approved ? "default" : "secondary"}
                      className={`w-fit text-xs ${
                        rev.is_approved
                          ? "bg-green-500/20 text-green-600 border-green-500/30"
                          : "bg-red-500/20 text-red-600 border-red-500/30"
                      }`}
                    >
                      {rev.is_approved ? "✓ Approved" : "✗ Hidden"}
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {rev.is_approved ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-orange-500 hover:bg-orange-500/10 h-8 w-8"
                        onClick={() => handleReject(rev._id)}
                        disabled={isRejecting}
                        title="Hide review"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-500 hover:bg-green-500/10 h-8 w-8"
                        onClick={() => handleApprove(rev._id)}
                        disabled={isApproving}
                        title="Approve review"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => handleDelete(rev._id)}
                      disabled={isDeleting}
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {rev.comment}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-3">
                  {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetReviewsQuery, useDeleteReviewMutation } from "@/services/review-api";
import { Loader2, Star, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const { data: reviewsResponse, isLoading, refetch } = useGetReviewsQuery({});
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const reviews = reviewsResponse?.data || [];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id).unwrap();
        toast.success("Review deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete review");
      }
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
          <Star className="w-7 h-7 text-primary" />
          User Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all reviews submitted by the users.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No reviews available yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev: any) => (
            <Card key={rev._id} className="flex flex-col h-full border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base font-bold flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      By: <span className="font-semibold text-foreground">{rev.user_id?.user_name}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
                    onClick={() => handleDelete(rev._id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {rev.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

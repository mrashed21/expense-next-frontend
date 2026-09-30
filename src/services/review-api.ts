import { apiSlice } from "./api-slice";

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public — approved reviews for landing page
    getReviews: builder.query({
      query: () => ({
        url: "/reviews",
        method: "GET",
      }),
      providesTags: ["Reviews"] as any,
    }),
    // User — own reviews
    getMyReviews: builder.query({
      query: () => ({
        url: "/reviews/my-reviews",
        method: "GET",
      }),
      providesTags: ["Reviews"] as any,
    }),
    submitReview: builder.mutation({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reviews"] as any,
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"] as any,
    }),
    // Admin — all reviews
    getAdminReviews: builder.query({
      query: () => ({
        url: "/reviews/admin",
        method: "GET",
      }),
      providesTags: ["Reviews"] as any,
    }),
    approveReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/admin/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reviews"] as any,
    }),
    rejectReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/admin/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reviews"] as any,
    }),
    adminDeleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"] as any,
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useDeleteReviewMutation,
  useGetAdminReviewsQuery,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useAdminDeleteReviewMutation,
} = reviewApi;

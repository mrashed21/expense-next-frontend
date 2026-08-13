import { apiSlice } from "./api-slice";

export const feedbackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFeedbacks: builder.query({
      query: () => ({
        url: "/feedbacks/admin",
        method: "GET",
      }),
      providesTags: ["Feedbacks"] as any,
    }),
    getMyFeedbacks: builder.query({
      query: () => ({
        url: "/feedbacks/my-feedbacks",
        method: "GET",
      }),
      providesTags: ["Feedbacks"] as any,
    }),
    submitFeedback: builder.mutation({
      query: (data) => ({
        url: "/feedbacks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feedbacks"] as any,
    }),
    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedbacks"] as any,
    }),
    markFeedbackReviewed: builder.mutation({
      query: (id) => ({
        url: `/feedbacks/admin/${id}/review`,
        method: "PATCH",
      }),
      invalidatesTags: ["Feedbacks"] as any,
    }),
    replyToFeedback: builder.mutation({
      query: ({ id, admin_reply }) => ({
        url: `/feedbacks/admin/${id}/reply`,
        method: "PATCH",
        body: { admin_reply },
      }),
      invalidatesTags: ["Feedbacks"] as any,
    }),
  }),
});

export const {
  useGetAdminFeedbacksQuery,
  useGetMyFeedbacksQuery,
  useSubmitFeedbackMutation,
  useDeleteFeedbackMutation,
  useMarkFeedbackReviewedMutation,
  useReplyToFeedbackMutation,
} = feedbackApi;

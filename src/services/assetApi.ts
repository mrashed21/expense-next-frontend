import { apiSlice } from "./apiSlice";

export const assetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: (params) => ({
        url: "/assets",
        params,
      }),
      providesTags: ["Assets"],
    }),
    getAssetById: builder.query({
      query: (id) => `/assets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Assets", id }],
    }),
    createAsset: builder.mutation({
      query: (data) => ({
        url: "/assets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    updateAsset: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assets"],
    }),
    restoreAsset: builder.mutation({
      query: (id) => ({
        url: `/assets/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Assets"],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useRestoreAssetMutation,
} = assetApi;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterState {
  searchQuery: string;
  dateRange:
    | "today"
    | "yesterday"
    | "last7days"
    | "last30days"
    | "thisMonth"
    | "prevMonth"
    | "thisYear"
    | "custom";
  customStartDate?: string;
  customEndDate?: string;
  type?: "all" | "income" | "expense" | "transfer";
  accountId?: string;
  categoryId?: string;
}

const initialState: FilterState = {
  searchQuery: "",
  dateRange: "thisMonth",
  type: "all",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setDateRange: (state, action: PayloadAction<FilterState["dateRange"]>) => {
      state.dateRange = action.payload;
    },
    setCustomDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>,
    ) => {
      state.dateRange = "custom";
      state.customStartDate = action.payload.startDate;
      state.customEndDate = action.payload.endDate;
    },
    setTypeFilter: (state, action: PayloadAction<FilterState["type"]>) => {
      state.type = action.payload;
    },
    setAccountFilter: (state, action: PayloadAction<string | undefined>) => {
      state.accountId = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.categoryId = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.dateRange = "thisMonth";
      state.type = "all";
      state.accountId = undefined;
      state.categoryId = undefined;
      state.customStartDate = undefined;
      state.customEndDate = undefined;
    },
  },
});

export const {
  setSearchQuery,
  setDateRange,
  setCustomDateRange,
  setTypeFilter,
  setAccountFilter,
  setCategoryFilter,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;

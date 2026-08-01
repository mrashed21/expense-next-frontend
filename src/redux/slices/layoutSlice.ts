import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LayoutState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  activeTab: string;
}

const initialState: LayoutState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  activeTab: "dashboard",
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, toggleMobileMenu, setMobileMenuOpen, setActiveTab } = layoutSlice.actions;
export default layoutSlice.reducer;

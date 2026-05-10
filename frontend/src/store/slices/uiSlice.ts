import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  navOpen: boolean;
  activeSection: string;
}

const initialState: UiState = {
  theme: 'dark',
  navOpen: false,
  activeSection: 'home',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleNav: (state) => {
      state.navOpen = !state.navOpen;
    },
    setNavOpen: (state, action: PayloadAction<boolean>) => {
      state.navOpen = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleNav, setNavOpen, setActiveSection } = uiSlice.actions;
export default uiSlice.reducer;

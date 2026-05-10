import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectsState {
  selectedTech: string[];
  searchQuery: string;
}

const initialState: ProjectsState = {
  selectedTech: [],
  searchQuery: '',
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      const tech = action.payload;
      if (state.selectedTech.includes(tech)) {
        state.selectedTech = state.selectedTech.filter(t => t !== tech);
      } else {
        state.selectedTech.push(tech);
      }
    },
    clearFilters: (state) => {
      state.selectedTech = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setFilter, clearFilters, setSearchQuery } = projectsSlice.actions;
export default projectsSlice.reducer;

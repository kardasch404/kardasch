import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContactState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const initialState: ContactState = {
  status: 'idle',
  error: null,
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    setContactStatus: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
      state.status = action.payload;
    },
    setContactError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetContact: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setContactStatus, setContactError, resetContact } = contactSlice.actions;
export default contactSlice.reducer;

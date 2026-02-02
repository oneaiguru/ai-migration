import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  sidebarOpen: boolean
  currentModule: string | null
  loading: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  sidebarOpen: true,
  currentModule: null,
  loading: false,
  mobileMenuOpen: false,
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setCurrentModule: (state, action: PayloadAction<string | null>) => {
      state.currentModule = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    }
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentModule,
  setLoading,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme
} = uiSlice.actions

export default uiSlice.reducer

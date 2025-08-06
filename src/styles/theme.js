import { createTheme } from '@mui/material';

export const themeObj = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#43a047' },
    background: { default: '#f9fafb', paper: '#fff' },
    error: { main: '#e53935' },
    text: { primary: '#222b45' }
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 400 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px 0 rgba(60,72,88,0.08)',
          borderRadius: 16,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        }
      }
    }
  }
});

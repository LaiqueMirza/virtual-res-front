import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';
import ResumeView from './components/ResumeView';
import './App.css';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7', // Purple color to match the sidebar
    },
    success: {
      main: '#4caf50', // Green color for the upload button
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view" element={<ResumeView />} />
          <Route path="/view/:id" element={<ResumeView />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;

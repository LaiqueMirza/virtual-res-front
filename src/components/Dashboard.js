import React from 'react';
import { Box, Paper } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import ResumeList from './ResumeList';

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Sidebar />
      </Box>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Header />
          <ResumeList />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
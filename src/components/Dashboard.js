import React, { useState } from 'react';
import { Box, Paper, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import Header from './Header';
import ResumeList from './ResumeList';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <Sidebar />
        </Box>
      )}
      
      {/* Drawer for mobile */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            '& .MuiDrawer-paper': { width: 240 },
          }}
        >
          <Sidebar />
        </Drawer>
      )}
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%' }}>
        {isMobile && (
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 2 }}>
          <Header />
          <ResumeList />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
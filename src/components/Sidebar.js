import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#d1c4e9', // Light purple color matching the wireframe
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: 1 }}>
        <Typography variant="h6" component="div" align="center">
          Resume Analytics
        </Typography>
      </Box>
      
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}>
            <ListItemText primary="Menu 1" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ bgcolor: 'white', borderRadius: 1 }}>
            <ListItemText primary="Menu 2" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
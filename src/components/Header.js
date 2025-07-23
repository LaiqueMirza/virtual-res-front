import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, useMediaQuery, useTheme, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadResumePopup from './UploadResumePopup';
import LogoutButton from './LogoutButton';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);

  const handleOpenUploadPopup = () => {
    setUploadPopupOpen(true);
  };

  const handleCloseUploadPopup = () => {
    setUploadPopupOpen(false);
  };

  return (
    <Box sx={{
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between', 
      alignItems: { xs: 'flex-start', md: 'center' }, 
      gap: { xs: 2, md: 0 },
      mb: 3
    }}>
      <Typography variant="h5" component="div" sx={{ mb: { xs: 1, md: 0 } }}>
        Resumes analytics
      </Typography>
      
      <Box sx={{
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        alignItems: { xs: 'stretch', sm: 'center' },
        width: { xs: '100%', md: 'auto' }
      }}>
        <TextField
          size="small"
          placeholder="search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 200, md: 250 } }}
        />
        
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<CloudUploadIcon />}
          sx={{ 
            textTransform: 'none',
            whiteSpace: 'nowrap',
            width: { xs: '100%', sm: 'auto' }
          }}
          onClick={handleOpenUploadPopup}
        >
          {isMobile ? 'Upload' : 'Upload New Resume'}
        </Button>
        
        {/* Logout Button */}
        <LogoutButton />

        {/* Upload Resume Popup */}
        <UploadResumePopup 
          open={uploadPopupOpen} 
          onClose={handleCloseUploadPopup} 
        />
      </Box>
    </Box>
  );
};

export default Header;
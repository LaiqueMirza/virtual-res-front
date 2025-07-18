import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadResumePopup from './UploadResumePopup';
import LogoutButton from './LogoutButton';

const Header = () => {
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);

  const handleOpenUploadPopup = () => {
    setUploadPopupOpen(true);
  };

  const handleCloseUploadPopup = () => {
    setUploadPopupOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" component="div">
        Resumes analytics
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          sx={{ width: 250 }}
        />
        
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<CloudUploadIcon />}
          sx={{ textTransform: 'none' }}
          onClick={handleOpenUploadPopup}
        >
          Upload New Resume
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
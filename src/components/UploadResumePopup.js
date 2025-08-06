import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import axios from '../utils/axiosConfig';

const UploadResumePopup = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [file, setFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [fileError, setFileError] = useState('');
  const [resumeNameError, setResumeNameError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const allowedFileTypes = ['.pdf', '.doc', '.docx'];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedFileTypes.includes(fileExtension)) {
      setFileError(`Invalid file type. Please upload ${allowedFileTypes.join(', ')} files only.`);
      setFile(null);
      return;
    }

    setFileError('');
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    let hasError = false;
    
    if (!file) {
      setFileError('Please select a file to upload.');
      hasError = true;
    }
    
    if (!resumeName.trim()) {
      setResumeNameError('Please enter a resume name.');
      hasError = true;
    }
    
    if (hasError) return;

    setUploading(true);
    setFileError('');
    setResumeNameError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resumeName', resumeName);

      const response = await axios.post('/v1/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess(true);
      setFile(null);
      setResumeName('');
      
      // Refresh the resume list after successful upload
      if (window.refreshResumeList) {
        window.refreshResumeList();
      }
      
      setTimeout(() => {
        onClose();
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setFileError(`Upload failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setResumeName('');
      setFileError('');
      setResumeNameError('');
      setUploadSuccess(false);
      onClose();
    }
  };
  
  const handleResumeNameChange = (event) => {
    setResumeName(event.target.value);
    if (event.target.value.trim()) {
      setResumeNameError('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
          width: { xs: '95%', sm: '90%', md: '85%' },
          maxWidth: { xs: '100%', sm: '500px', md: '600px' },
          margin: isMobile ? 0 : 'auto'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
        px: { xs: '1rem', sm: '1.5rem', md: '2rem' },
        pt: { xs: '1rem', sm: '1.5rem', md: '2rem' }
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"}
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
            fontWeight: 600
          }}
        >
          Upload New Resume
        </Typography>
        <IconButton 
          onClick={handleClose} 
          disabled={uploading}
          sx={{
            width: { xs: '2.5rem', sm: '2.75rem', md: '3rem' },
            height: { xs: '2.5rem', sm: '2.75rem', md: '3rem' }
          }}
        >
          <CloseIcon fontSize={isMobile ? "medium" : "large"} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        px: { xs: '1rem', sm: '1.5rem', md: '2rem' },
        py: { xs: '0.5rem', sm: '1rem', md: '1.5rem' }
      }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
            lineHeight: 1.5
          }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
          molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum
          numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium
          optio, eaque rerum! Provident similique accusantium nemo autem.
        </Typography>
        
        <TextField
          label="Resume Name"
          variant="outlined"
          fullWidth
          value={resumeName}
          onChange={handleResumeNameChange}
          error={!!resumeNameError}
          helperText={resumeNameError}
          disabled={uploading}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            mb: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
            },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
            }
          }}
        />

        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
            p: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            textAlign: 'center',
            bgcolor: '#f9f9f9',
            mb: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            height: { xs: '120px', sm: '140px', md: '160px', lg: '180px' },
            minHeight: '100px',
            maxHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            position: 'relative',
            width: '100%',
            '&:hover': {
              bgcolor: '#f0f0f0',
            },
          }}
          component="label"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          {uploading ? (
            <CircularProgress size={isMobile ? 30 : isTablet ? 35 : 40} />
          ) : file ? (
            <>
              <CloudUploadIcon sx={{ 
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '2.75rem' }, 
                color: 'success.main', 
                mb: { xs: '0.5rem', sm: '0.75rem', md: '1rem' }
              }} />
              <Typography 
                variant={isMobile ? "body2" : "body1"}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 500,
                  mb: { xs: '0.25rem', sm: '0.5rem' }
                }}
              >
                {file.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
                }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{ 
                width: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '2.75rem' }, 
                height: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '2.75rem' }, 
                borderRadius: '50%', 
                border: '2px solid #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: { xs: '0.5rem', sm: '0.75rem', md: '1rem' }
              }}>
                <AddIcon sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' }
                }} />
              </Box>
              <Typography 
                variant={isMobile ? "body2" : "body1"}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  textAlign: 'center',
                  lineHeight: 1.4
                }}
              >
                {isMobile ? 'Tap to upload or drag file here' : 'Click to upload or Drag and Drop the file here'}
              </Typography>
            </>
          )}
        </Box>

        {fileError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {fileError}
          </Typography>
        )}

        {uploadSuccess && (
          <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
            Resume uploaded successfully!
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: { xs: '1rem', sm: '1.5rem', md: '2rem' }, 
        gap: { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
        flexDirection: isMobile ? 'column' : 'row',
        '& .MuiButton-root': {
          width: isMobile ? '100%' : 'auto',
          minWidth: { xs: '100%', sm: '120px', md: '140px' }
        }
      }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          variant="outlined"
          size={isMobile ? "large" : "medium"}
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            py: { xs: '0.75rem', sm: '0.5rem', md: '0.6rem' },
            order: isMobile ? 2 : 1
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || !!resumeNameError}
          variant="contained"
          size={isMobile ? "large" : "medium"}
          startIcon={uploading ? 
            <CircularProgress 
              size={isMobile ? 24 : 20} 
              sx={{ color: 'inherit' }}
            /> : 
            <CloudUploadIcon fontSize={isMobile ? "medium" : "small"} />
          }
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            py: { xs: '0.75rem', sm: '0.5rem', md: '0.6rem' },
            order: isMobile ? 1 : 2
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadResumePopup;
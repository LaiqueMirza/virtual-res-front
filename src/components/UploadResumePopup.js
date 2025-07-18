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
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import axios from '../utils/axiosConfig';

const UploadResumePopup = ({ open, onClose }) => {
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
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">Upload New Resume(Pop Up)</Typography>
        <IconButton onClick={handleClose} disabled={uploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            textAlign: 'center',
            bgcolor: '#f9f9f9',
            mb: 2,
            height: 150,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            position: 'relative',
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
            <CircularProgress size={40} />
          ) : file ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body1">{file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                border: '2px solid #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 1
              }}>
                <AddIcon />
              </Box>
              <Typography variant="body1">Click to upload or Drag and Drop the file here</Typography>
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

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={!file || !resumeName.trim() || uploading || uploadSuccess}
          fullWidth
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadResumePopup;
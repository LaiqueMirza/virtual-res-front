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
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from '../utils/axiosConfig';

const GenerateLinkPopup = ({ open, onClose, resumeId, resumeName }) => {
  const [clientName, setClientName] = useState('');
  const [clientNameError, setClientNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validateClientName = (name) => {
    if (!name.trim()) {
      setClientNameError('Please enter a client name');
      return false;
    }
    setClientNameError('');
    return true;
  };

  const handleClientNameChange = (e) => {
    setClientName(e.target.value);
    if (e.target.value.trim()) {
      validateClientName(e.target.value);
    } else {
      setClientNameError('');
    }
  };

  const handleGenerateLink = async () => {
    if (!validateClientName(clientName)) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await axios.post('/v1/resume/share/link', {
        client_name: clientName,
        resumes_uploaded_id: resumeId,
      });

      const { data } = response.data;
      if (!data) {
        throw new Error('Failed to generate link');
      }

      const shareLink = `${process.env.REACT_APP_FRONTEND_URL}/view/${data.share_link_id}`;
      setGeneratedLink(shareLink);
    } catch (error) {
      console.error('Error generating link:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Failed to generate link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        setSubmitError('Failed to copy link to clipboard');
      });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setClientName('');
      setClientNameError('');
      setSubmitError('');
      setGeneratedLink('');
      onClose();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
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
          <Typography variant="h6">Generate a New Link</Typography>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate a unique link to share this resume with your client. The link will allow them to view the resume without needing to create an account.
          </Typography>

          {!generatedLink ? (
            <TextField
              label="Client Name"
              variant="outlined"
              fullWidth
              value={clientName}
              onChange={handleClientNameChange}
              error={!!clientNameError}
              helperText={clientNameError || 'Enter the name of the client you are sharing with'}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
          ) : (
            <Box sx={{ mb: 2, mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" color="primary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                  {generatedLink}
                </a>
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
              >
                Copy Link
              </Button>
            </Box>
          )}

          {submitError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {submitError}
            </Typography>
          )}
        </DialogContent>

        {!generatedLink && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateLink}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Generate Unique Link'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default GenerateLinkPopup;
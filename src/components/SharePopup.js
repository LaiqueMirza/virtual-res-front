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
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SharePopup = ({ open, onClose, resumeId, resumeName }) => {
  const [emails, setEmails] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmails = (emailsString) => {
    if (!emailsString.trim()) {
      setEmailError('Please enter at least one email address');
      return false;
    }

    const emailList = emailsString.split(',').map(email => email.trim());
    
    for (const email of emailList) {
      if (!emailRegex.test(email)) {
        setEmailError(`Invalid email format: ${email}`);
        return false;
      }
    }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    setEmails(e.target.value);
    if (e.target.value.trim()) {
      validateEmails(e.target.value);
    } else {
      setEmailError('');
    }
  };

  const handleShare = async () => {
    if (!validateEmails(emails)) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const emailList = emails.split(',').map(email => email.trim());

      const response = await fetch('http://localhost:8000/v1/resume/share/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          resume_template_id: resumeId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to share resume');
      }

      setSubmitSuccess(true);
      setEmails('');
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error sharing resume:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmails('');
      setEmailError('');
      setSubmitError('');
      setSubmitSuccess(false);
      onClose();
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
        <Typography variant="h6">Share</Typography>
        <IconButton onClick={handleClose} disabled={isSubmitting}>
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

        {/* <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
            <a href="#" style={{ textDecoration: 'none' }}>Unique Visible Link Here</a>
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            sx={{ ml: 1 }}
          >
            Copy
          </Button>
        </Box> */}

        <TextField
          label="Add email here"
          variant="outlined"
          fullWidth
          value={emails}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError || 'Enter multiple emails separated by commas'}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
          placeholder="email1@example.com, email2@example.com"
        />

        {submitError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
        )}

        {submitSuccess && (
          <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
            Resume shared successfully!
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleShare}
          disabled={isSubmitting || submitSuccess}
          fullWidth
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SharePopup;
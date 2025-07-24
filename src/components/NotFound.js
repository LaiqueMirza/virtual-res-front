import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h1" sx={{ fontSize: { xs: '5rem', sm: '8rem' }, color: 'primary.main', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
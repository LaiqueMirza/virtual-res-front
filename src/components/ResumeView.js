import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const ResumeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid link. Please check the URL.');
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      try {
        const response = await fetch(`http://localhost:8000/v1/resume/preview?id=${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Resume not found');
        }
        const data = await response.json();
        setResume(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load resume. Please try again later.');
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          {error || 'Invalid link. Please check the URL.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {resume && resume.success && (
        <>
          <Typography variant="h4" sx={{ mb: 3 }}>
            {resume.resumeName}
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: resume.content }} />
        </>
      )}
    </Box>
  );
};

export default ResumeView;
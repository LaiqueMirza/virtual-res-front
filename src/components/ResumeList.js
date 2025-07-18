import React, { useState, useEffect } from 'react';
import { Box, Pagination, Typography, CircularProgress } from '@mui/material';
import ResumeCard from './ResumeCard';
import axios from '../utils/axiosConfig';

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResumes = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/v1/resume/resume_lists', {
        page: pageNum,
        limit: 10
      });
      
      if (response.data.success) {
        setResumes(response.data.data.resumes);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        throw new Error('Failed to fetch resumes');
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch resumes');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(page);
  }, [page]);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Add this function to the global window object to allow refreshing from other components
  useEffect(() => {
    window.refreshResumeList = () => fetchResumes(page);
    
    return () => {
      // Clean up when component unmounts
      delete window.refreshResumeList;
    };
  }, [page]);

  return (
    <Box sx={{ mt: 2, px: 1 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 2 }}>
          Error: {error}
        </Typography>
      ) : resumes.length === 0 ? (
        <Typography sx={{ py: 2 }}>
          No resumes found. Upload a resume to get started.
        </Typography>
      ) : (
        <>
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.resumes_uploaded_id}
              id={resume.resumes_uploaded_id}
              resumeName={resume.resume_name}
              uploadedBy={resume.uploaded_by}
              date={formatDate(resume.created_at)}
            />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ResumeList;
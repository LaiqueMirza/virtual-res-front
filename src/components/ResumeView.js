import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

// Resume view component that renders a resume using Material-UI components

const ResumeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);

  // Effect to fetch the resume data when the ID changes
  useEffect(() => {
    if (!id) {
      setError('Invalid link. Please check the URL.');
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      try {
        // Get user's IP and location (in a real app, you would use a geolocation service)
        // For demo purposes, we're using placeholder values
        const userIP = '192.168.1.1';
        const userCity = 'New York';
        const userCountry = 'USA';

        console.log('Fetching resume with ID:', id);
        const response = await fetch('http://localhost:8000/v1/resume/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_share_links_id: String(id), // Ensure ID is sent as a string
            viewer_ip: userIP,
            location_city: userCity,
            location_country: userCountry
          })
        });
        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Resume not found');
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        const {data} = responseData;
        setResume(data);
        setLoading(false);
        
        // We'll render the template in a useEffect that watches for resume changes
        if (!data || !data.resume_json) {
          console.error('Resume JSON data not available in the response');
        }
      } catch (err) {
        setError(err.message || 'Failed to load resume. Please try again later.');
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  // Effect to parse resume data when it changes
  useEffect(() => {
    console.log('Resume state changed:', resume);
    
    if (resume && resume.resume_json) {
      console.log('Resume JSON available, type:', typeof resume.resume_json);
      
      try {
        // Parse the JSON string to get the resume data
        let cv;
        
        // First check if resume_json is already an object
        if (typeof resume.resume_json === 'object' && resume.resume_json !== null) {
          console.log('resume_json is already an object');
          cv = resume.resume_json;
        } else {
          try {
            // First try parsing once (in case it's already a JSON string)
            cv = JSON.parse(resume.resume_json);
            // Check if it's still a string that needs parsing
            if (typeof cv === 'string') {
              cv = JSON.parse(cv);
            }
          } catch (parseError) {
            console.error('First parsing attempt failed:', parseError);
            // If double parsing fails, try single parsing
            cv = JSON.parse(resume.resume_json);
          }
        }
        
        console.log('Parsed resume data:', cv);
        setParsedResume(cv);
      } catch (error) {
        console.error('Error parsing resume JSON:', error);
        setError(`Error parsing resume data: ${error.message}`);
      }
    }
  }, [resume]);

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

  // If no parsed resume data is available yet but we're not loading or in error state
  if (!loading && !error && !parsedResume) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Waiting for resume data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {parsedResume && (
        <Paper 
          elevation={1}
          sx={{ 
            maxWidth: '780px', 
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: '#fff'
          }}
        >
          {/* Header */}
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {parsedResume.basics.name}
          </Typography>
          
          <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 0.5 }}>
            {parsedResume.basics.headline}
          </Typography>
          
          <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
            {parsedResume.basics.address}<br />
            {parsedResume.basics.phone} • <a href={`mailto:${parsedResume.basics.email}`}>{parsedResume.basics.email}</a>
          </Typography>

          {/* Career Summary */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Career Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {parsedResume.careerSummary}
          </Typography>

          {/* Skills */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Key Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {parsedResume.skills.map((skill, index) => (
              <Box 
                key={index}
                sx={{ 
                  backgroundColor: '#e7f1ff', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '0.3rem',
                  fontSize: '0.8rem'
                }}
              >
                {skill}
              </Box>
            ))}
          </Box>

          {/* Achievements */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Achievements
          </Typography>
          <Box component="ul" sx={{ ml: 3, mb: 2 }}>
            {parsedResume.achievements.map((achievement, index) => (
              <Box component="li" key={index} sx={{ mb: 0.5 }}>
                <Typography variant="body1">{achievement}</Typography>
              </Box>
            ))}
          </Box>

          {/* Employment History */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Employment History
          </Typography>
          {parsedResume.employmentHistory.map((job, jobIndex) => (
            <Box key={jobIndex} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {job.title} – {job.company}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                {job.start} – {job.end} | {job.location}
              </Typography>
              <Box component="ul" sx={{ ml: 3 }}>
                {job.bullets.map((bullet, bulletIndex) => (
                  <Box component="li" key={bulletIndex} sx={{ mb: 0.5 }}>
                    <Typography variant="body1">{bullet}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}

          {/* Projects */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Selected Projects
          </Typography>
          {parsedResume.projects.map((project, projectIndex) => (
            <Box key={projectIndex} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {project.name}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                {project.period} • {project.tech.join(', ')}
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
            </Box>
          ))}

          {/* Education */}
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
            Education
          </Typography>
          {parsedResume.education.map((edu, eduIndex) => (
            <Box key={eduIndex} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {edu.degree}, {edu.year}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                {edu.institution}, {edu.location}
              </Typography>
              {edu.highlights && (
                <Box component="ul" sx={{ ml: 3 }}>
                  {edu.highlights.map((highlight, highlightIndex) => (
                    <Box component="li" key={highlightIndex} sx={{ mb: 0.5 }}>
                      <Typography variant="body1">{highlight}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default ResumeView;
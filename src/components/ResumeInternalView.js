import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import axios from '../utils/axiosConfig';

const ResumeInternalView = () => {
  const { id: encodedId } = useParams(); // Get the ID from URL params
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);

  // Effect to fetch the resume data when the ID changes
  useEffect(() => {
    const fetchInternalPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the internal-preview API
        const response = await axios.post("/v1/resume/internal-preview", {
          resumes_uploaded_id: parseInt(encodedId, 10) // Convert string ID to number
        });
        
        if (response.data.success) {
          // Set the resume data directly
          setResume({
            resume_json: response.data.data.resume_json
          });
        } else {
          throw new Error(response.data.message || "Failed to fetch resume data");
        }
      } catch (err) {
        console.error("Error fetching internal preview:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load resume preview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInternalPreview();
  }, [encodedId]);

  // Parse the resume JSON when it changes
  useEffect(() => {
    if (resume && resume.resume_json) {
      try {
        // Parse the JSON string to get the resume data
        let cv;

        // First check if resume_json is already an object
        if (
          typeof resume.resume_json === "object" &&
          resume.resume_json !== null
        ) {
          cv = resume.resume_json;
        } else {
          try {
            // First try parsing once (in case it's already a JSON string)
            cv = JSON.parse(resume.resume_json);
            // Check if it's still a string that needs parsing
            if (typeof cv === "string") {
              cv = JSON.parse(cv);
            }
          } catch (parseError) {
            // Removed console.error to reduce console output
            // If double parsing fails, try single parsing
            cv = JSON.parse(resume.resume_json);
          }
        }

        // Removed console.log to reduce console output
        setParsedResume(cv);
      } catch (error) {
        // Keep this console.error for debugging critical parsing errors
        console.error("Error parsing resume JSON:", error);
        setError(`Error parsing resume data: ${error.message}`);
      }
    }
  }, [resume]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading resume...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: "100vh", p: 3 }}>
      {parsedResume ? (
        <Paper
          elevation={1}
          sx={{
            maxWidth: "780px",
            margin: "0 auto",
            padding: "2rem",
            backgroundColor: "#fff",
            overflowY: "auto",
          }}>
          {/* Header */}
          <Box id="header">
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {parsedResume.basics.name}
            </Typography>

            <Typography variant="body1" sx={{ fontStyle: "italic", mb: 0.5 }}>
              {parsedResume.basics.headline}
            </Typography>

            <Typography variant="body1" sx={{ fontStyle: "italic", mb: 2 }}>
              {parsedResume.basics.address}
              <br />
              {parsedResume.basics.phone} •{" "}
              <a href={`mailto:${parsedResume.basics.email}`}>
                {parsedResume.basics.email}
              </a>
            </Typography>
          </Box>

          {/* Career Summary */}
          <Box id="career-summary">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Career Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {parsedResume.careerSummary}
            </Typography>
          </Box>

          {/* Skills */}
          <Box id="skills">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Key Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
              {parsedResume.skills.map((skill, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "#e7f1ff",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.3rem",
                    fontSize: "0.8rem",
                  }}>
                  {skill}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Achievements */}
          <Box id="achievements">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Achievements
            </Typography>
            <Box component="ul" sx={{ ml: 3, mb: 2 }}>
              {parsedResume.achievements.map((achievement, index) => (
                <Box component="li" key={index} sx={{ mb: 0.5 }}>
                  <Typography variant="body1">{achievement}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Employment History */}
          <Box id="employment-history">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Employment History
            </Typography>
            {parsedResume.employmentHistory.map((job, jobIndex) => (
              <Box key={jobIndex} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {job.title} – {job.company}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", mb: 1 }}>
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
          </Box>

          {/* Projects */}
          <Box id="projects">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Selected Projects
            </Typography>
            {parsedResume.projects.map((project, projectIndex) => (
              <Box key={projectIndex} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {project.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", mb: 1 }}>
                  {project.period} • {project.tech.join(", ")}
                </Typography>
                <Typography variant="body1" paragraph>
                  {project.description}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Education */}
          <Box id="education">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 1,
                borderBottom: "1px solid #ccc",
                pb: 0.5,
              }}>
              Education
            </Typography>
            {parsedResume.education.map((edu, eduIndex) => (
              <Box key={eduIndex} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {edu.degree}, {edu.year}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", mb: 1 }}>
                  {edu.institution}, {edu.location}
                </Typography>
                {edu.highlights && (
                  <Box component="ul" sx={{ ml: 3 }}>
                    {edu.highlights.map((highlight, highlightIndex) => (
                      <Box
                        component="li"
                        key={highlightIndex}
                        sx={{ mb: 0.5 }}>
                        <Typography variant="body1">{highlight}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      ) : (
        <Typography variant="body1">Waiting for resume data...</Typography>
      )}
    </Box>
  );
};

export default ResumeInternalView;
import React, { useEffect, useState, useRef } from 'react';
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
  
  // Refs for tracking elements
  const resumeContainerRef = useRef(null);
  const sectionRefs = useRef({});
  
  // Engagement tracking states
  const [scrollDepthData, setScrollDepthData] = useState({
    thresholds: {
      25: false,
      50: false,
      75: false,
      100: false
    },
    maxScrollDepth: 0,
    lastScrollTimestamp: null
  });
  
  const [sectionVisibility, setSectionVisibility] = useState({});
  const [clickInteractions, setClickInteractions] = useState([]);
  
  // Store section entry/exit timestamps
  const [sectionEngagement, setSectionEngagement] = useState({});
  
  // Tracking session start time
  const sessionStartTime = useRef(Date.now());

  // Function to send engagement data to analytics backend
  const sendEngagementData = (eventType, eventData) => {
    // This is a placeholder function that would send data to your analytics backend
    // For now, we'll just log it to the console
    console.log(`Analytics event: ${eventType}`, eventData);
    
    // In a real implementation, you would send this data to your backend
    // Example:
    // fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/resume/engagement`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     resume_share_links_id: id,
    //     event_type: eventType,
    //     event_data: eventData,
    //     timestamp: Date.now()
    //   })
    // });
  };
  
  // Function to get user's IP address using ipify API
  const getUserIP = async () => {
    try {
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      // Try alternative IP API if first one fails
      try {
        const response = await fetch('https://api.db-ip.com/v2/free/self');
        if (response.ok) {
          const data = await response.json();
          return data.ipAddress;
        }
      } catch (fallbackError) {
        console.error('Fallback IP service also failed:', fallbackError);
      }
      return '0.0.0.0'; // Final fallback IP
    }
  };

  // Function to get browser and device information
  const getBrowserInfo = () => {
    try {
      const userAgent = navigator.userAgent || 'Unknown';
      let browserName = 'Unknown';
      let deviceType = 'Unknown';
      
      // Detect browser
      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = 'Chrome';
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = 'Firefox';
      } else if (userAgent.match(/safari/i)) {
        browserName = 'Safari';
      } else if (userAgent.match(/opr\//i)) {
        browserName = 'Opera';
      } else if (userAgent.match(/edg/i)) {
        browserName = 'Edge';
      } else if (userAgent.match(/msie|trident/i)) {
        browserName = 'Internet Explorer';
      }
      
      // Detect device type
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
        deviceType = 'Tablet';
      } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
        deviceType = 'Mobile';
      } else {
        deviceType = 'Desktop';
      }
      
      return { browserName, deviceType, userAgent };
    } catch (error) {
      console.error('Error getting browser info:', error);
      return { browserName: 'Unknown', deviceType: 'Unknown', userAgent: 'Unknown' };
    }
  };

  // Function to get user's location
  const getUserLocation = async (ip) => {
    try {
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the API returned an error
      if (data.error) {
        throw new Error(data.reason || 'API returned an error');
      }
      
      return {
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      // Try alternative location API if first one fails
      try {
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || 'Unknown',
            country: data.country || 'Unknown'
          };
        }
      } catch (fallbackError) {
        console.error('Fallback location service also failed:', fallbackError);
      }
      return { city: 'Unknown', country: 'Unknown' };
    }
  };

  // Effect to fetch the resume data when the ID changes
  useEffect(() => {
    if (!id) {
      setError('Invalid link. Please check the URL.');
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      try {
        console.log('Fetching resume with ID:', id);
        
        // Create a promise that will resolve with user information or reject after timeout
        const getUserInfoWithTimeout = async (timeoutMs = 5000) => {
          return Promise.race([
            // The actual user info gathering
            (async () => {
              try {
                const userIP = await getUserIP();
                const { browserName, deviceType, userAgent } = getBrowserInfo();
                const { city, country } = await getUserLocation(userIP);
                
                console.log('User info gathered successfully:', { 
                  userIP, browserName, deviceType, city, country 
                });
                
                return { 
                  userIP, 
                  browserName, 
                  deviceType, 
                  userAgent,
                  city, 
                  country,
                  infoComplete: true
                };
              } catch (error) {
                console.error('Error gathering complete user info:', error);
                // Return partial info if available
                const { browserName, deviceType, userAgent } = getBrowserInfo();
                return { 
                  userIP: '0.0.0.0', 
                  browserName, 
                  deviceType, 
                  userAgent,
                  city: 'Unknown', 
                  country: 'Unknown',
                  infoComplete: false
                };
              }
            })(),
            
            // Timeout promise
            new Promise((resolve) => {
              setTimeout(() => {
                console.log('User info gathering timed out, using fallback values');
                const { browserName, deviceType, userAgent } = getBrowserInfo();
                // Return partial info after timeout
                resolve({ 
                  userIP: '0.0.0.0', 
                  browserName, 
                  deviceType, 
                  userAgent,
                  city: 'Unknown', 
                  country: 'Unknown',
                  infoComplete: false
                });
              }, timeoutMs);
            })
          ]);
        };
        
        // Get user info with a 5-second timeout
        const userInfo = await getUserInfoWithTimeout(5000);
        
        // Prepare the request payload
        const payload = {
          resume_share_links_id: String(id), // Ensure ID is sent as a string
          viewer_ip: userInfo.userIP,
          device_type: userInfo.deviceType,
          browser_info: `${userInfo.browserName} (${userInfo.userAgent})`,
          location_city: userInfo.city,
          location_country: userInfo.country
        };
        
        console.log('Sending API request with payload:', payload);
        
        // Set a timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Make the API call with whatever info we have
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/resume/preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
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

  // Utility functions for tracking user engagement
  
  // Track scroll depth
  const trackScrollDepth = () => {
    if (!resumeContainerRef.current) return;
    
    const container = resumeContainerRef.current;
    const containerHeight = container.scrollHeight - container.clientHeight;
    const scrollPosition = container.scrollTop;
    const scrollPercentage = Math.floor((scrollPosition / containerHeight) * 100);
    
    // Update max scroll depth
    setScrollDepthData(prev => ({
      ...prev,
      maxScrollDepth: Math.max(prev.maxScrollDepth, scrollPercentage),
      lastScrollTimestamp: Date.now()
    }));
    
    // Check if we've passed any thresholds
    const thresholds = [25, 50, 75, 100];
    thresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !scrollDepthData.thresholds[threshold]) {
        // Record that we've passed this threshold
        setScrollDepthData(prev => ({
          ...prev,
          thresholds: {
            ...prev.thresholds,
            [threshold]: true
          }
        }));
        
        // Log the event and send to analytics
        console.log(`Scroll threshold reached: ${threshold}%`);
        sendEngagementData('scroll_depth', { 
          threshold, 
          timestamp: Date.now(),
          resume_id: id
        });
      }
    });
  };
  
  // Track section visibility
  const trackSectionVisibility = () => {
    if (!resumeContainerRef.current) return;
    
    const container = resumeContainerRef.current;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const containerHeight = container.scrollHeight;
    
    // Check each section's visibility
    Object.entries(sectionRefs.current).forEach(([sectionId, sectionRef]) => {
      if (!sectionRef) return;
      
      const sectionRect = sectionRef.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate section position relative to the container
      const sectionTop = sectionRect.top - containerRect.top + container.scrollTop;
      const sectionBottom = sectionTop + sectionRect.height;
      
      // Check if section is visible
      const isVisible = 
        (sectionTop < containerBottom && sectionBottom > containerTop) &&
        (sectionTop < containerHeight && sectionBottom > 0);
      
      // Update section visibility state
      setSectionVisibility(prev => {
        // If visibility changed, update engagement metrics
        if (prev[sectionId] !== isVisible) {
          const timestamp = Date.now();
          
          // If section became visible, record entry time
          if (isVisible) {
            setSectionEngagement(prev => ({
              ...prev,
              [sectionId]: {
                ...prev[sectionId],
                entryTime: timestamp,
                // Reset exit time when re-entering
                exitTime: null
              }
            }));
            console.log(`Section entered: ${sectionId}`);
            sendEngagementData('section_enter', {
              section_id: sectionId,
              timestamp: timestamp,
              resume_id: id
            });
          } 
          // If section is no longer visible and had an entry time, record exit time and duration
          else if (sectionEngagement[sectionId]?.entryTime) {
            const entryTime = sectionEngagement[sectionId].entryTime;
            const duration = timestamp - entryTime;
            
            setSectionEngagement(prev => ({
              ...prev,
              [sectionId]: {
                ...prev[sectionId],
                exitTime: timestamp,
                duration: (prev[sectionId]?.duration || 0) + duration
              }
            }));
            console.log(`Section exited: ${sectionId}, duration: ${duration}ms`);
            sendEngagementData('section_exit', {
              section_id: sectionId,
              duration: duration,
              timestamp: timestamp,
              resume_id: id
            });
          }
        }
        
        return { ...prev, [sectionId]: isVisible };
      });
    });
  };
  
  // Track click interactions
  const trackClickInteraction = (event) => {
    // Only track clicks on links
    if (event.target.tagName.toLowerCase() === 'a') {
      const link = event.target;
      const url = link.href;
      const isExternal = link.hostname !== window.location.hostname;
      const timestamp = Date.now();
      
      // Find which section contains this link
      let sectionId = 'unknown';
      Object.entries(sectionRefs.current).forEach(([id, ref]) => {
        if (ref && ref.contains(link)) {
          sectionId = id;
        }
      });
      
      // Record the click interaction
      const clickData = {
        url,
        isExternal,
        timestamp,
        sectionId
      };
      
      setClickInteractions(prev => [...prev, clickData]);
      console.log('Link clicked:', clickData);
      
      // Send to analytics backend
      sendEngagementData('link_click', {
        ...clickData,
        resume_id: id
      });
    }
  };
  
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
  
  // Initialize section refs when resume data is loaded
  useEffect(() => {
    if (!parsedResume) return;
    
    // Define the sections we want to track
    const sectionIds = [
      'header',
      'career-summary',
      'skills',
      'achievements',
      'employment-history',
      'projects',
      'education'
    ];
    
    // Initialize section engagement data
    const initialSectionEngagement = {};
    sectionIds.forEach(id => {
      initialSectionEngagement[id] = {
        entryTime: null,
        exitTime: null,
        duration: 0,
        visits: 0
      };
    });
    
    setSectionEngagement(initialSectionEngagement);
    setSectionVisibility(sectionIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}));
    
    console.log('Section tracking initialized');
  }, [parsedResume]);
  
  // Set up event listeners for tracking
  useEffect(() => {
    // Skip if still loading or there's an error
    if (loading || error || !parsedResume || !resumeContainerRef.current) return;
    
    const container = resumeContainerRef.current;
    
    // Throttle function to limit how often the scroll handler fires
    const throttle = (callback, delay) => {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          callback(...args);
        }
      };
    };
    
    // Throttled scroll handler
    const handleScroll = throttle(() => {
      trackScrollDepth();
      trackSectionVisibility();
    }, 200); // 200ms throttle
    
    // Click handler
    const handleClick = (e) => {
      trackClickInteraction(e);
    };
    
    // Add event listeners
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('click', handleClick);
    
    // Initial tracking call
    handleScroll();
    
    // Clean up event listeners on unmount
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('click', handleClick);
      
      // On unmount, record final engagement metrics
      const sessionEndTime = Date.now();
      const totalSessionDuration = sessionEndTime - sessionStartTime.current;
      
      // Log final engagement metrics
      console.log('Session ended. Total duration:', totalSessionDuration, 'ms');
      console.log('Max scroll depth:', scrollDepthData.maxScrollDepth, '%');
      console.log('Section engagement:', sectionEngagement);
      console.log('Click interactions:', clickInteractions);
      
      // Send final engagement data to analytics backend
      sendEngagementData('session_end', { 
        duration: totalSessionDuration,
        max_scroll_depth: scrollDepthData.maxScrollDepth,
        section_engagement: sectionEngagement,
        click_interactions: clickInteractions.length,
        thresholds_reached: Object.entries(scrollDepthData.thresholds)
          .filter(([_, reached]) => reached)
          .map(([threshold]) => parseInt(threshold)),
        resume_id: id
      });
    };
  }, [loading, error, parsedResume, scrollDepthData.thresholds, sectionEngagement]);

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
          ref={resumeContainerRef}
          sx={{ 
            maxWidth: '780px', 
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: '#fff',
            // maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <Box 
            id="header" 
            ref={el => sectionRefs.current['header'] = el}
          >
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
          </Box>

          {/* Career Summary */}
          <Box 
            id="career-summary" 
            ref={el => sectionRefs.current['career-summary'] = el}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1, borderBottom: '1px solid #ccc', pb: 0.5 }}>
              Career Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {parsedResume.careerSummary}
            </Typography>
          </Box>

          {/* Skills */}
          <Box 
            id="skills" 
            ref={el => sectionRefs.current['skills'] = el}
          >
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
          </Box>

          {/* Achievements */}
          <Box 
            id="achievements" 
            ref={el => sectionRefs.current['achievements'] = el}
          >
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
          </Box>

          {/* Employment History */}
          <Box 
            id="employment-history" 
            ref={el => sectionRefs.current['employment-history'] = el}
          >
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
          </Box>

          {/* Projects */}
          <Box 
            id="projects" 
            ref={el => sectionRefs.current['projects'] = el}
          >
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
          </Box>

          {/* Education */}
          <Box 
            id="education" 
            ref={el => sectionRefs.current['education'] = el}
          >
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
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ResumeView;
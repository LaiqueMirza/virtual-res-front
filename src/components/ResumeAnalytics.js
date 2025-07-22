import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  Computer as ComputerIcon,
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  TouchApp as TouchAppIcon
} from '@mui/icons-material';
import axios from '../utils/axiosConfig';

const ResumeAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedViewData, setSelectedViewData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [id]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/v1/resume/analytics', {
        resumes_uploaded_id: id
      });
      
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTimeSpent = (timeString) => {
    if (!timeString) return '0s';
    try {
      // Convert "00:05:30" format to readable format
      const parts = timeString.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      return '0s';
    }
  };

  const calculateTotalViews = () => {
    if (!analyticsData?.resume_shared) return 0;
    return analyticsData.resume_shared.reduce((total, share) => {
      return total + (share.resume_viewed ? share.resume_viewed.length : 0);
    }, 0);
  };

  const calculateTotalLinks = () => {
    return analyticsData?.resume_shared?.length || 0;
  };

  const calculateAverageTimeSpent = () => {
    if (!analyticsData?.resume_shared) return '0s';
    
    let totalSeconds = 0;
    let viewCount = 0;
    
    analyticsData.resume_shared.forEach(share => {
      if (share.resume_viewed) {
        share.resume_viewed.forEach(view => {
          if (view.total_time_spent) {
            try {
              const parts = view.total_time_spent.split(':');
              const seconds = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
              totalSeconds += seconds;
              viewCount++;
            } catch (error) {
              // Skip invalid time format
            }
          }
        });
      }
    });
    
    if (viewCount === 0) return '0s';
    
    const avgSeconds = Math.round(totalSeconds / viewCount);
    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);
    const secs = avgSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleTrackingDataClick = (viewData) => {
    setSelectedViewData(viewData);
    setTrackingModalOpen(true);
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedViewData(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No analytics data available</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Resume Analytics
        </Typography>
      </Box>

      {/* Resume Info Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {analyticsData.resume_data?.resume_name?.charAt(0) || 'R'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {analyticsData.resume_data?.resume_name || 'Unknown Resume'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded by - {analyticsData.resume_data?.uploaded_by || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(analyticsData.resume_data?.uploaded_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h5" color="primary">
                  {calculateTotalViews()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total View Count
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" color="primary">
                  {calculateTotalLinks()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Link Count
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" color="primary">
                  {calculateAverageTimeSpent()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Read Time
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Shared Links */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Shared Links
      </Typography>
      
      {analyticsData.resume_shared && analyticsData.resume_shared.length > 0 ? (
        analyticsData.resume_shared.map((share, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {share.client_name || share.email || 'Unknown Client'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    {share.share_type ? `${share.share_type.charAt(0).toUpperCase() + share.share_type.slice(1)} - ` : ''}
                    {formatDate(share.shared_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip 
                    label={share.expires_at ? `Expires: ${formatDate(share.expires_at)}` : 'No Expiry'} 
                    size="small" 
                    color={share.expires_at && new Date(share.expires_at) > new Date() ? 'success' : 'error'}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">
                    Linked Opened: {share.resume_viewed ? share.resume_viewed.length : 0} times
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            
            <AccordionDetails>
              {share.resume_viewed && share.resume_viewed.length > 0 ? (
                share.resume_viewed.map((view, viewIndex) => (
                  <Card key={viewIndex} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {formatDate(view.resume_viewed_at)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Date & Time
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">
                              {formatTimeSpent(view.total_time_spent)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Time Spent
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {view.viewer_ip || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            IP Address
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ComputerIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {view.device_type || 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Device
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {view.browser_info || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Browser
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {view.location_city && view.location_country 
                                ? `${view.location_city}, ${view.location_country}` 
                                : 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Location
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Scroll Percentage: {view.scroll_percentage || 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Referrer: {view.referrer_url || 'Direct'}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleTrackingDataClick(view)}
                        >
                          Tracking Data
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No views recorded for this link yet.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No shared links found for this resume.
          </Typography>
        </Paper>
      )}

      {/* Tracking Data Modal */}
      <Dialog 
        open={trackingModalOpen} 
        onClose={handleCloseTrackingModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detailed Tracking Data</Typography>
          <IconButton onClick={handleCloseTrackingModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedViewData && (
            <Box>
              {/* View Summary */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Viewed At</Typography>
                    <Typography variant="body1">{formatDate(selectedViewData.resume_viewed_at)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Time</Typography>
                    <Typography variant="body1">{formatTimeSpent(selectedViewData.total_time_spent)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Device</Typography>
                    <Typography variant="body1">{selectedViewData.device_type || 'Unknown'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">
                      {selectedViewData.location_city && selectedViewData.location_country 
                        ? `${selectedViewData.location_city}, ${selectedViewData.location_country}` 
                        : 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Section Time Tracking */}
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                Section Time Tracking
              </Typography>
              
              {selectedViewData.resume_view_events && selectedViewData.resume_view_events.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Section</strong></TableCell>
                        <TableCell><strong>Time Spent</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedViewData.resume_view_events.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>{event.section_name || 'Unknown Section'}</TableCell>
                          <TableCell>{formatTimeSpent(event.total_time_spent)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No section tracking data available
                  </Typography>
                </Paper>
              )}

              {/* Click Events */}
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TouchAppIcon sx={{ mr: 1 }} />
                Click Events
              </Typography>
              
              {selectedViewData.resume_click_events && selectedViewData.resume_click_events.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Section</strong></TableCell>
                        <TableCell><strong>Element Text</strong></TableCell>
                        <TableCell><strong>Link/Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedViewData.resume_click_events.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>{event.section_name || 'Unknown Section'}</TableCell>
                          <TableCell>{event.element_text || 'N/A'}</TableCell>
                          <TableCell>
                            {event.link ? (
                              <Link 
                                href={event.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ wordBreak: 'break-all' }}
                              >
                                {event.link}
                              </Link>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No click events recorded
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseTrackingModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeAnalytics;
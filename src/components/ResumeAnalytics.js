// Add responsive styles to the existing component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
  LocationOn as LocationOnIcon,
  TouchApp as TouchAppIcon
} from '@mui/icons-material';
import axios from '../utils/axiosConfig';

const ResumeAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedView, setExpandedView] = useState(null);

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

  useEffect(() => {
    fetchAnalyticsData();
  }, [id]);

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

  // const calculateTotalViews = () => {
  //   if (!analyticsData?.resume_shared) return 0;
  //   return analyticsData.resume_shared.reduce((total, share) => {
  //     return total + (share.resume_viewed ? share.resume_viewed.length : 0);
  //   }, 0);
  // };

  // const calculateTotalLinks = () => {
  //   return analyticsData?.resume_shared?.length || 0;
  // };

  // const calculateAverageTimeSpent = () => {
  //   if (!analyticsData?.resume_shared) return '0s';
    
  //   let totalSeconds = 0;
  //   let viewCount = 0;
    
  //   analyticsData.resume_shared.forEach(share => {
  //     if (share.resume_viewed) {
  //       share.resume_viewed.forEach(view => {
  //         if (view.total_time_spent) {
  //           try {
  //             const parts = view.total_time_spent.split(':');
  //             const seconds = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
  //             totalSeconds += seconds;
  //             viewCount++;
  //           } catch (error) {
  //             // Skip invalid time format
  //           }
  //         }
  //       });
  //     }
  //   });
    
  //   if (viewCount === 0) return '0s';
    
  //   const avgSeconds = Math.round(totalSeconds / viewCount);
  //   const hours = Math.floor(avgSeconds / 3600);
  //   const minutes = Math.floor((avgSeconds % 3600) / 60);
  //   const secs = avgSeconds % 60;
    
  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m ${secs}s`;
  //   } else if (minutes > 0) {
  //     return `${minutes}m ${secs}s`;
  //   } else {
  //     return `${secs}s`;
  //   }
  // };


  const handleTrackingDataClick = (viewId) => {
    const isExpanded = expandedView !== viewId;
    setExpandedView(isExpanded ? viewId : null);
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
		<Box sx={{ 
			p: { xs: 2, sm: 3 }, 
			maxWidth: 1200, 
			mx: "auto",
			width: '100%'
		}}>
			{/* Header */}
			<Box sx={{ 
				display: "flex", 
				alignItems: "center", 
				mb: { xs: 2, sm: 3 },
				flexWrap: 'wrap'
			}}>
				<IconButton 
					onClick={() => navigate(-1)} 
					sx={{ 
						mr: { xs: 1, sm: 2 },
						p: { xs: 1, sm: 1.5 }
					}}
				>
					<ArrowBackIcon />
				</IconButton>
				<Typography 
					variant={isMobile ? "h5" : "h4"} 
					component="h1"
					sx={{
						fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
					}}
				>
					Resume Analytics
				</Typography>
			</Box>

			{/* Resume Info Card */}
			<Paper sx={{ 
				p: { xs: 2, sm: 3 }, 
				mb: { xs: 2, sm: 3 }, 
				borderRadius: 2,
				overflow: 'hidden'
			}}>
				<Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
					<Grid item xs={12} md={4}>
						<Box sx={{ 
							display: "flex", 
							alignItems: "center",
							flexDirection: { xs: 'column', sm: 'row' },
							textAlign: { xs: 'center', sm: 'left' }
						}}>
							<Avatar
								sx={{ 
									mr: { xs: 0, sm: 2 }, 
									mb: { xs: 1, sm: 0 },
									bgcolor: "primary.main", 
									width: { xs: 48, sm: 56 }, 
									height: { xs: 48, sm: 56 }
								}}>
								{analyticsData.resume_data?.resume_name?.charAt(0) || "R"}
							</Avatar>
							<Box>
								<Typography 
									variant={isMobile ? "subtitle1" : "h6"}
									sx={{
										fontSize: { xs: '1rem', sm: '1.25rem' },
										wordBreak: 'break-word'
									}}
								>
									{analyticsData.resume_data?.resume_name || "Unknown Resume"}
								</Typography>
								<Typography 
									variant="body2" 
									color="text.secondary"
									sx={{
										fontSize: { xs: '0.8rem', sm: '0.875rem' }
									}}
								>
									Uploaded by -{" "}
									{analyticsData.resume_data?.uploaded_by || "Unknown"}
								</Typography>
								<Typography 
									variant="body2" 
									color="text.secondary"
									sx={{
										fontSize: { xs: '0.8rem', sm: '0.875rem' }
									}}
								>
									{formatDate(analyticsData.resume_data?.uploaded_at)}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} md={8}>
						<Grid container spacing={{ xs: 1, sm: 2 }} textAlign="center">
							<Grid item xs={4}>
								<Typography 
									variant={isMobile ? "h6" : "h5"} 
									color="primary"
									sx={{
										fontSize: { xs: '1.1rem', sm: '1.5rem' }
									}}
								>
									{analyticsData.resume_data?.total_view_count || 0}
								</Typography>
								<Typography 
									variant="body2" 
									color="text.secondary"
									sx={{
										fontSize: { xs: '0.7rem', sm: '0.875rem' },
										lineHeight: 1.2
									}}
								>
									Total View Count
								</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography 
									variant={isMobile ? "h6" : "h5"} 
									color="primary"
									sx={{
										fontSize: { xs: '1.1rem', sm: '1.5rem' }
									}}
								>
									{analyticsData.resume_data?.total_link_count || 0}
								</Typography>
								<Typography 
									variant="body2" 
									color="text.secondary"
									sx={{
										fontSize: { xs: '0.7rem', sm: '0.875rem' },
										lineHeight: 1.2
									}}
								>
									Total Link Count
								</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography 
									variant={isMobile ? "h6" : "h5"} 
									color="primary"
									sx={{
										fontSize: { xs: '1.1rem', sm: '1.5rem' }
									}}
								>
									{formatTimeSpent(
										analyticsData.resume_data?.average_read_time
									) || "0s"}
								</Typography>
								<Typography 
									variant="body2" 
									color="text.secondary"
									sx={{
										fontSize: { xs: '0.7rem', sm: '0.875rem' },
										lineHeight: 1.2
									}}
								>
									Average Read Time
								</Typography>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Paper>

			{/* Shared Links */}
			<Typography 
				variant={isMobile ? "h6" : "h5"} 
				sx={{ 
					mb: { xs: 1.5, sm: 2 },
					fontSize: { xs: '1.25rem', sm: '1.5rem' }
				}}
			>
				Shared Links
			</Typography>

			{analyticsData.resume_shared && analyticsData.resume_shared.length > 0 ? (
				analyticsData.resume_shared.map((share, index) => (
					<Accordion key={index} sx={{ 
						mb: { xs: 1.5, sm: 2 },
						borderRadius: 1,
						overflow: 'hidden'
					}}>
						<AccordionSummary 
							expandIcon={<ExpandMoreIcon />}
							sx={{
								'& .MuiAccordionSummary-content': {
									margin: { xs: '8px 0', sm: '12px 0' }
								}
							}}
						>
							<Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
								<Grid item xs={12} sm={4}>
									<Typography 
										variant={isMobile ? "body1" : "subtitle1"} 
										fontWeight="bold"
										sx={{
											fontSize: { xs: '0.9rem', sm: '1rem' },
											wordBreak: 'break-word'
										}}
									>
										{share.client_name || share.email || "Unknown Client"}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={4}>
									<Typography 
										variant="body2" 
										color="text.secondary"
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' }
										}}
									>
										<Box 
											component="span" 
											sx={{ 
												cursor: 'text', 
												userSelect: 'all',
												display: 'inline-block',
												wordBreak: 'break-all'
											}}
										>
											{share.referrer_url || "Direct"}
										</Box>
									</Typography>
								</Grid>
								<Grid item xs={12} sm={4}>
									<Typography 
										variant="body2"
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' }
										}}
									>
										Linked Opened:{" "}
										{share.resume_viewed ? share.resume_viewed.length : 0} times
									</Typography>
								</Grid>
							</Grid>
						</AccordionSummary>

						<AccordionDetails>
							{share.resume_viewed && share.resume_viewed.length > 0 ? (
								share.resume_viewed.map((view, viewIndex) => {
									const viewId = `view-${index}-${viewIndex}`;
									return (
										<Card key={viewIndex} sx={{ mb: 2, bgcolor: "grey.50" }}>
											<CardContent>
												<Grid container spacing={2}>
													<Grid item xs={12} sm={6} md={2}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}>
															<ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
															<Typography variant="body2">
																{formatDate(view.resume_viewed_at)}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary">
															Date & Time
														</Typography>
													</Grid>

													<Grid item xs={12} sm={6} md={2}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}>
															<Typography variant="body2">
																{formatTimeSpent(view.total_time_spent)}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary">
															Time Spent
														</Typography>
													</Grid>

													<Grid item xs={12} sm={6} md={2}>
														<Typography variant="body2" sx={{ mb: 1 }}>
															{view.viewer_ip || "N/A"}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary">
															IP Address
														</Typography>
													</Grid>

													<Grid item xs={12} sm={6} md={2}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}>
															<ComputerIcon sx={{ mr: 1, fontSize: 16 }} />
															<Typography variant="body2">
																{view.device_type || "Unknown"}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary">
															Device
														</Typography>
													</Grid>

													<Grid item xs={12} sm={6} md={2}>
														<Tooltip title={view.browser_info || "Unknown"}>
															<Typography
																variant="body2"
																sx={{
																	mb: 1,
																	whiteSpace: "nowrap",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	maxWidth: "150px",
																}}>
																{view.browser_info || "Unknown"}
															</Typography>
														</Tooltip>
														<Typography
															variant="caption"
															color="text.secondary">
															Browser
														</Typography>
													</Grid>

													<Grid item xs={12} sm={6} md={2}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}>
															<LocationOnIcon sx={{ mr: 1, fontSize: 16 }} />
															<Typography variant="body2">
																{view.location_city && view.location_country
																	? `${view.location_city}, ${view.location_country}`
																	: "Unknown"}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary">
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
												</Grid>
												<Accordion
													expanded={expandedView === viewId}
													key={viewId}
													sx={{
														boxShadow: "none",
														"&:before": { display: "none" },
													}}>
													{/* Remove the AccordionSummary completely */}
													<AccordionSummary
														onClick={() => handleTrackingDataClick(viewId)}
														expandIcon={<ExpandMoreIcon />}>
														<Typography
															variant="h6"
															sx={{ display: "flex", alignItems: "center" }}>
															Tracking Data
														</Typography>
													</AccordionSummary>
													<AccordionDetails>
														<Box>
															{/* Section Time Tracking */}
															<Typography
																variant="h6"
																sx={{
																	mb: 2,
																	display: "flex",
																	alignItems: "center",
																}}>
																<ScheduleIcon sx={{ mr: 1 }} />
																Section Time Tracking
															</Typography>

															{view.resume_view_events &&
															view.resume_view_events.length > 0 ? (
																<TableContainer
																	component={Paper}
																	sx={{ mb: 3 }}>
																	<Table size="small">
																		<TableHead>
																			<TableRow>
																				<TableCell>
																					<strong>Section</strong>
																				</TableCell>
																				<TableCell>
																					<strong>Time Spent</strong>
																				</TableCell>
																			</TableRow>
																		</TableHead>
																		<TableBody>
																			{view.resume_view_events.map(
																				(event, eventIndex) => (
																					<TableRow key={eventIndex}>
																						<TableCell>
																							{event.section_name ||
																								"Unknown Section"}
																						</TableCell>
																						<TableCell>
																							{formatTimeSpent(
																								event.total_time_spent
																							)}
																						</TableCell>
																					</TableRow>
																				)
																			)}
																		</TableBody>
																	</Table>
																</TableContainer>
															) : (
																<Paper
																	sx={{ p: 2, mb: 3, textAlign: "center" }}>
																	<Typography
																		variant="body2"
																		color="text.secondary">
																		No section tracking data available
																	</Typography>
																</Paper>
															)}

															{/* Click Events */}
															<Typography
																variant="h6"
																sx={{
																	mb: 2,
																	display: "flex",
																	alignItems: "center",
																}}>
																<TouchAppIcon sx={{ mr: 1 }} />
																Click Events
															</Typography>

															{view.resume_click_events &&
															view.resume_click_events.length > 0 ? (
																<TableContainer component={Paper}>
																	<Table size="small">
																		<TableHead>
																			<TableRow>
																				<TableCell>
																					<strong>Element ID</strong>
																				</TableCell>
																				<TableCell>
																					<strong>Element Text</strong>
																				</TableCell>
																				<TableCell>
																					<strong>Link</strong>
																				</TableCell>
																				<TableCell>
																					<strong>Timestamp</strong>
																				</TableCell>
																			</TableRow>
																		</TableHead>
																		<TableBody>
																			{view.resume_click_events.map(
																				(click, clickIndex) => (
																					<TableRow key={clickIndex}>
																						<TableCell>
																							{click.section_name}
																						</TableCell>
																						<TableCell>
																							{click.element_text}
																						</TableCell>
																						<TableCell>
																							{click.link}
																						</TableCell>
																						<TableCell>
																							{formatDate(click.created_at)}
																						</TableCell>
																					</TableRow>
																				)
																			)}
																		</TableBody>
																	</Table>
																</TableContainer>
															) : (
																<Paper sx={{ p: 2, textAlign: "center" }}>
																	<Typography
																		variant="body2"
																		color="text.secondary">
																		No click events recorded.
																	</Typography>
																</Paper>
															)}
														</Box>
													</AccordionDetails>
												</Accordion>
											</CardContent>
										</Card>
									);
								})
							) : (
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ textAlign: "center", py: 2 }}>
									No views recorded for this link yet.
								</Typography>
							)}
						</AccordionDetails>
					</Accordion>
				))
			) : (
				<Paper sx={{ p: 3, textAlign: "center" }}>
					<Typography variant="body1" color="text.secondary">
						No shared links found for this resume.
					</Typography>
				</Paper>
			)}
		</Box>
	);
};

export default ResumeAnalytics;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button, Avatar, Box, Grid, useMediaQuery, useTheme, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SharePopup from './SharePopup';
import GenerateLinkPopup from './GenerateLinkPopup';

const ResumeCard = ({ resumeName, uploadedBy, date, id, totalViewCount, totalLinkCount, averageReadTime }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [generateLinkPopupOpen, setGenerateLinkPopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenSharePopup = () => {
    setSharePopupOpen(true);
    handleCloseMenu();
  };

  const handleCloseSharePopup = () => {
    setSharePopupOpen(false);
  };

  const handleOpenGenerateLinkPopup = () => {
    setGenerateLinkPopupOpen(true);
    handleCloseMenu();
  };

  const handleCloseGenerateLinkPopup = () => {
    setGenerateLinkPopupOpen(false);
  };

  const handleAnalyticsClick = () => {
    navigate(`/resume-analytics/${id}`);
    handleCloseMenu();
  };

  const handlePreviewClick = () => {
    navigate(`/preview/${id}`);
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ 
      mb: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, 
      borderRadius: { xs: '0.5rem', sm: '0.75rem', md: '1rem' }, 
      boxShadow: { xs: 1, sm: 2, md: 3 },
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: isMobile ? 'none' : 'translateY(-0.25rem)',
        boxShadow: isMobile ? theme.shadows[2] : theme.shadows[4],
      },
      width: '100%',
      maxWidth: { xs: '100%', sm: '95%', md: '90%' },
      margin: { xs: '0 0 1rem 0', sm: '0 auto 1.25rem auto', md: '0 auto 1.5rem auto' }
    }}>
      <CardContent sx={{ p: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={{ xs: 1.5, sm: 2, md: 2.5 }}>
          <Box display="flex" alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Avatar sx={{ 
              mr: { xs: 1.5, sm: 2, md: 2.5 }, 
              bgcolor: "grey.300",
              width: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              height: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
            }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                component="div" 
                noWrap 
                sx={{ 
                  maxWidth: { xs: '180px', sm: '220px', md: '280px', lg: '320px' },
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' },
                  fontWeight: { xs: 500, sm: 600 }
                }}
              >
                {resumeName}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                  lineHeight: 1.4
                }}
              >
                Uploaded by - {uploadedBy} | {date}
              </Typography>
            </Box>
          </Box>
          
          {/* Analytics Data Section - Responsive Layout */}
          <Box 
            display="flex" 
            alignItems="center" 
            gap={{ xs: 1, sm: 1.5, md: 2, lg: 3 }}
            flexWrap="wrap"
            justifyContent={{ xs: 'space-around', sm: 'flex-end' }}
            width={{ xs: '100%', sm: 'auto' }}
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexDirection: 'column',
              minWidth: { xs: '60px', sm: '70px', md: '80px' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.25, sm: 0.5 }, 
                    color: 'primary.main',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                />
                <Typography 
                  variant={isMobile ? "body2" : "body1"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}
                >
                  {totalViewCount}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
              >
                Views
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexDirection: 'column',
              minWidth: { xs: '60px', sm: '70px', md: '80px' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.25, sm: 0.5 }, 
                    color: 'primary.main',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                />
                <Typography 
                  variant={isMobile ? "body2" : "body1"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}
                >
                  {totalLinkCount}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
              >
                Links
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexDirection: 'column',
              minWidth: { xs: '70px', sm: '80px', md: '90px' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.25, sm: 0.5 }, 
                    color: 'primary.main',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                />
                <Typography 
                  variant={isMobile ? "body2" : "body1"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}
                >
                  {averageReadTime}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
              >
                Avg. Time
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ 
        justifyContent: { xs: "center", sm: "flex-end" }, 
        flexWrap: 'wrap', 
        gap: { xs: 0.5, sm: 0.75, md: 1 },
        p: { xs: '0.75rem 1rem', sm: '1rem 1.25rem', md: '1rem 1.5rem' },
        pt: { xs: 0, sm: 0.5 }
      }}>
        {isMobile ? (
          <>
            <Button 
              size={isMobile ? "small" : "medium"} 
              startIcon={<VisibilityIcon fontSize={isMobile ? "small" : "medium"} />}
              onClick={handlePreviewClick}
              sx={{ 
                flexGrow: { xs: 1, sm: 0 },
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                py: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                px: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                minWidth: { xs: 'auto', sm: '100px', md: '120px' }
              }}
            >
              Preview
            </Button>
            <IconButton 
              onClick={handleOpenMenu}
              sx={{
                width: { xs: '2.5rem', sm: '2.75rem', md: '3rem' },
                height: { xs: '2.5rem', sm: '2.75rem', md: '3rem' }
              }}
            >
              <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  minWidth: { xs: '160px', sm: '180px', md: '200px' },
                  maxWidth: { xs: '90vw', sm: '300px' },
                  borderRadius: { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
                }
              }}
            >
              <MenuItem 
                onClick={handleOpenGenerateLinkPopup}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' },
                  py: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                <LinkIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.75, sm: 1, md: 1.25 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                /> 
                Generate Link
              </MenuItem>
              <MenuItem 
                onClick={handleOpenSharePopup}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' },
                  py: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                <ShareIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.75, sm: 1, md: 1.25 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                /> 
                Share
              </MenuItem>
              <MenuItem 
                onClick={handleAnalyticsClick}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' },
                  py: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                <AnalyticsIcon 
                  fontSize={isMobile ? "small" : "medium"} 
                  sx={{ 
                    mr: { xs: 0.75, sm: 1, md: 1.25 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  }} 
                /> 
                Analytics
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              size={isMobile ? "small" : "medium"}
              startIcon={<LinkIcon fontSize={isMobile ? "small" : "medium"} />}
              onClick={handleOpenGenerateLinkPopup}
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                py: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                px: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                minWidth: { xs: 'auto', sm: '90px', md: '120px' }
              }}
            >
              {isTablet ? 'New Link' : 'Generate a new Link'}
            </Button>
            <Button 
              size={isMobile ? "small" : "medium"} 
              startIcon={<VisibilityIcon fontSize={isMobile ? "small" : "medium"} />}
              onClick={handlePreviewClick}
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                py: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                px: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                minWidth: { xs: 'auto', sm: '80px', md: '100px' }
              }}
            >
              Preview
            </Button>
            <Button
              size={isMobile ? "small" : "medium"}
              startIcon={<ShareIcon fontSize={isMobile ? "small" : "medium"} />}
              onClick={handleOpenSharePopup}
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                py: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                px: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                minWidth: { xs: 'auto', sm: '70px', md: '90px' }
              }}
            >
              Share
            </Button>
            <Button 
              size={isMobile ? "small" : "medium"} 
              startIcon={<AnalyticsIcon fontSize={isMobile ? "small" : "medium"} />}
              onClick={handleAnalyticsClick}
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                py: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                px: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                minWidth: { xs: 'auto', sm: '90px', md: '110px' }
              }}
            >
              Analytics
            </Button>
          </>
        )}

        <SharePopup
          open={sharePopupOpen}
          onClose={handleCloseSharePopup}
          resumeId={id}
          resumeName={resumeName}
        />
        <GenerateLinkPopup
          open={generateLinkPopupOpen}
          onClose={handleCloseGenerateLinkPopup}
          resumeId={id}
          resumeName={resumeName}
        />
      </CardActions>
    </Card>
  );
};

export default ResumeCard;
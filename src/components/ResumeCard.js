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
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: "grey.300" }} />
            <Box>
              <Typography variant="h6" component="div" noWrap sx={{ maxWidth: { xs: '200px', sm: '250px', md: '300px' } }}>
                {resumeName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded by - {uploadedBy} | {date}
              </Typography>
            </Box>
          </Box>
          
          {/* Analytics Data Section - Responsive Layout */}
          <Box 
            display="flex" 
            alignItems="center" 
            gap={{ xs: 1, sm: 2, md: 3 }}
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="medium">
                  {totalViewCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Views
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="medium">
                  {totalLinkCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Links
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="medium">
                  {averageReadTime}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Avg. Time
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", flexWrap: 'wrap', gap: 1 }}>
        {isMobile ? (
          <>
            <Button 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={handlePreviewClick}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Preview
            </Button>
            <IconButton onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenGenerateLinkPopup}>
                <LinkIcon fontSize="small" sx={{ mr: 1 }} /> Generate Link
              </MenuItem>
              <MenuItem onClick={handleOpenSharePopup}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share
              </MenuItem>
              <MenuItem onClick={handleAnalyticsClick}>
                <AnalyticsIcon fontSize="small" sx={{ mr: 1 }} /> Analytics
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              size="small"
              startIcon={<LinkIcon />}
              onClick={handleOpenGenerateLinkPopup}>
              {isTablet ? 'New Link' : 'Generate a new Link'}
            </Button>
            <Button 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={handlePreviewClick}>
              Preview
            </Button>
            <Button
              size="small"
              startIcon={<ShareIcon />}
              onClick={handleOpenSharePopup}>
              Share
            </Button>
            <Button 
              size="small" 
              startIcon={<AnalyticsIcon />}
              onClick={handleAnalyticsClick}
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
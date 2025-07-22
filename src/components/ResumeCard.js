import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button, Avatar, Box, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SharePopup from './SharePopup';
import GenerateLinkPopup from './GenerateLinkPopup';

const ResumeCard = ({ resumeName, uploadedBy, date, id, totalViewCount, totalLinkCount, averageReadTime }) => {
  const navigate = useNavigate();
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [generateLinkPopupOpen, setGenerateLinkPopupOpen] = useState(false);

  const handleOpenSharePopup = () => {
    setSharePopupOpen(true);
  };

  const handleCloseSharePopup = () => {
    setSharePopupOpen(false);
  };

  const handleOpenGenerateLinkPopup = () => {
    setGenerateLinkPopupOpen(true);
  };

  const handleCloseGenerateLinkPopup = () => {
    setGenerateLinkPopupOpen(false);
  };

  const handleAnalyticsClick = () => {
    navigate(`/resume-analytics/${id}`);
  };

  const handlePreviewClick = () => {
    navigate(`/preview/${id}`);
  };

  return (
		<Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
			<CardContent>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center">
						<Avatar sx={{ mr: 2, bgcolor: "grey.300" }} />
						<Box>
							<Typography variant="h6" component="div">
								{resumeName}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Uploaded by - {uploadedBy} | {date}
							</Typography>
						</Box>
					</Box>
					
					{/* Analytics Data Section - Inline */}
					<Box display="flex" alignItems="center" gap={3}>
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
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button
					size="small"
					startIcon={<LinkIcon />}
					onClick={handleOpenGenerateLinkPopup}>
					Generate a new Link
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
				<Button 
					size="small" 
					startIcon={<AnalyticsIcon />}
					onClick={handleAnalyticsClick}
				>
					Analytics
				</Button>
			</CardActions>
		</Card>
	);
};

export default ResumeCard;
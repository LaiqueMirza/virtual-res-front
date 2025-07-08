import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Avatar, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import SharePopup from './SharePopup';
import GenerateLinkPopup from './GenerateLinkPopup';

const ResumeCard = ({ resumeName, uploadedBy, date, id }) => {
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

  return (
		<Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
			<CardContent>
				<Box display="flex" alignItems="center">
					<Avatar sx={{ mr: 2, bgcolor: "grey.300" }} />
					<Box>
						<Typography variant="h6" component="div">
							{resumeName}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Uploaded by - {uploadedBy}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{date}
						</Typography>
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
				<Button size="small" startIcon={<VisibilityIcon />}>
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
				<Button size="small" startIcon={<AnalyticsIcon />}>
					Analytics
				</Button>
			</CardActions>
		</Card>
	);
};

export default ResumeCard;
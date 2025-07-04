import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Avatar, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/BarChart';

const ResumeCard = ({ resumeName, uploadedBy, date }) => {
  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'grey.300' }} />
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
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" startIcon={<VisibilityIcon />}>
          Preview
        </Button>
        <Button size="small" startIcon={<ShareIcon />}>
          Share
        </Button>
        <Button size="small" startIcon={<AnalyticsIcon />}>
          Analytics
        </Button>
      </CardActions>
    </Card>
  );
};

export default ResumeCard;
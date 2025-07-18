import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button
      variant="outlined"
      color="inherit"
      onClick={handleLogout}
      sx={{ ml: 2 }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
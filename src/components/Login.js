import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state, default to "/"
  const from = location.state?.from?.pathname || '/';
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Redirect to intended destination after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      await login(email, password);
    }
  };

  // If already authenticated, redirect immediately (for direct access to login page)
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left side - Login Form */}
      <Box sx={{ width: { xs: '100%', md: '50%' }, p: { xs: 2, sm: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 410, mx: 'auto', width: '100%' }}>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              sx={{ 
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '28px', sm: '36px' },
                color: '#2B3674',
                mb: 1,
                lineHeight: 1.55
              }}
            >
              Sign In
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: { xs: '14px', sm: '16px' },
                color: '#A3AED0'
              }}
            >
              Enter your email and password to sign in!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#2B3674',
                  mb: 1
                }}
              >
                Email*
              </Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                placeholder="mail@simmmple.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: { xs: '12px', sm: '16px' },
                    height: { xs: '45px', sm: '50px' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E5F2'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4318FF'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4318FF'
                    },
                    '& input::placeholder': {
                      color: '#A3AED0',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: { xs: '13px', sm: '14px' },
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#2B3674',
                  mb: 1
                }}
              >
                Password*
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Min. 8 characters"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#A3AED0' }}
                      >
                        <Box 
                          component="img" 
                          src="/images/login/eye_icon_inner.svg" 
                          alt="toggle password visibility"
                          sx={{ width: { xs: 16, sm: 18 }, height: { xs: 10, sm: 12 } }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: { xs: '12px', sm: '16px' },
                    height: { xs: '45px', sm: '50px' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E5F2'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4318FF'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4318FF'
                    },
                    '& input::placeholder': {
                      color: '#A3AED0',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: { xs: '13px', sm: '14px' },
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>

            {/* Sign In Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                height: { xs: '48px', sm: '54px' },
                borderRadius: { xs: '12px', sm: '16px' },
                backgroundColor: '#4318FF',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '13px', sm: '14px' },
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#3311CC',
                  boxShadow: 'none'
                }
              }}
            >
              {isLoading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right side - Decorative Image */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: '0', md: '0 20px 20px 0' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 2, md: 4 }
        }}
      >
        {/* Flex container for content */}
        <Box sx={{ maxWidth: { xs: '250px', md: '300px' }, textAlign: 'center' }}>
          {/* Login Illustration */}
          <Box
            component="img"
            src="/images/login/resume-logo.png"
            alt="Login Illustration"
            sx={{
              width: '100%',
              maxWidth: { xs: '200px', md: '250px' },
              height: 'auto',
              mb: { xs: 2, md: 3 }
            }}
          />
          
          {/* Welcome Text */}
          <Box sx={{ 
            minHeight: { xs: '80px', md: '120px' }, 
            padding: { xs: '15px', md: '20px' } 
          }}>
            <Typography 
              sx={{ 
                fontFamily: '"Plus Jakarta Display", sans-serif',
                fontWeight: 400,
                fontSize: { xs: '14px', sm: '16px', md: '17.6px' },
                color: '#FFFFFF',
                mb: 1,
                opacity: 0.8,
                textAlign: 'center'
              }}
            >
              Welcome to the analysis application
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: '"Plus Jakarta Display", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '20px', sm: '24px', md: '29.3px' },
                color: '#FFFFFF',
                lineHeight: 1.55,
                textAlign: 'center'
              }}
            >
              Resume Analysis
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
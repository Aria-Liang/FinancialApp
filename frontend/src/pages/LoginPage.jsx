import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, Button, Paper, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import googlelogo from '../../public/googlelogo.jpg';
import githublogo from '../../public/githublogo.jpg';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext to store user ID
import { useNavigate } from 'react-router-dom'; // Import useNavigate for page redirection

const LoginSignup = () => {
  // Local state: to control form type, email, password, and name inputs
  const [formType, setFormType] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate(); // Initialize navigate to handle page navigation
  const { setUserId } = useContext(AuthContext); // Get setUserId from AuthContext to store the logged-in user's ID

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUserId(result.user.uid); // After successful Google login, set userId
      navigate("/overview"); // Redirect to the /overview page
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Handle GitHub login
  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setUserId(result.user.uid); // After successful GitHub login, set userId
      navigate("/overview"); // Redirect to the /overview page
    } catch (error) {
      console.error('GitHub login error:', error);
    }
  };

  // Handle local login
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      console.log('Login successful:', response.data);
      setUserId(response.data.user_id); // After successful login, set userId
      navigate("/overview"); // Redirect to the /overview page
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle local signup
  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', { name, email, password });
      console.log('Signup successful:', response.data);
      setUserId(response.data.user_id); // After successful signup, set userId
      navigate("/overview"); // Redirect to the /overview page
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Handle form submission based on whether it's login or signup
  const handleSubmit = () => {
    if (formType === 'login') {
      handleLogin(); // Call login handler for login form
    } else {
      handleSignup(); // Call signup handler for signup form
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ background: 'rgba(0, 0, 0, 0.7)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SellScaleHood
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Background Image with Strong Blur */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('/background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(15px)', // Apply strong blur to the background
          zIndex: -1,
        }}
      />

      {/* Centered Welcome Text */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          width: '100%',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <Typography variant="h2" color="white" sx={{ mb: 20 }}>
          Welcome to SellScaleHood!
        </Typography>
      </Box>

      {/* Centered Form */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)', // Subtracting navbar height
          zIndex: 2,
          position: 'relative',
          mt: 10,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent card
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Form Header */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
            {formType === 'login' ? 'Login' : 'Sign Up'}
          </Typography>

          {/* Show Name Field only for Signup */}
          {formType === 'signup' && (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {/* Email Field */}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Field */}
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            onClick={handleSubmit} // Call the form submit handler
          >
            {formType === 'login' ? 'Login' : 'Sign Up'}
          </Button>

          {/* Divider */}
          <Typography sx={{ mb: 2, color: '#333' }}>or</Typography>

          {/* OAuth Login Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
            <Button onClick={handleGoogleLogin}>
              <img src={googlelogo} alt="Google" style={{ height: '40px' }} />
            </Button>
            <Button onClick={handleGithubLogin}>
              <img src={githublogo} alt="GitHub" style={{ height: '40px', borderRadius: '8px' }} />
            </Button>
          </Box>

          {/* Switch between Login and Signup */}
          <Typography>
            {formType === 'login' ? (
              <>
                New user?{' '}
                <Button onClick={() => setFormType('signup')} sx={{ textTransform: 'none', color: 'primary.main' }}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button onClick={() => setFormType('login')} sx={{ textTransform: 'none', color: 'primary.main' }}>
                  Login
                </Button>
              </>
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginSignup;

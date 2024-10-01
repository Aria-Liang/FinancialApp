import React, { useState, useEffect, useContext } from 'react';
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; // Transaction Icon
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext for userId management

const drawerWidth = 240;

const Sidebar = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true); // Default sidebar open
  const theme = useTheme();
  const isMdOrBelow = useMediaQuery(theme.breakpoints.down('md')); // Detect screen width
  const { setUserId } = useContext(AuthContext); // Use context to update userId on logout
  const navigate = useNavigate(); // Navigation hook to handle route changes

  // Automatically collapse the sidebar on smaller screens
  useEffect(() => {
    if (isMdOrBelow) {
      setDrawerOpen(false); // Collapse sidebar on medium screens or below
    } else {
      setDrawerOpen(true); // Keep sidebar open on large screens
    }
  }, [isMdOrBelow]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('userId'); // Clear userId from localStorage
    setUserId(null); // Update context to reflect no logged-in user
    navigate('/'); // Redirect to the login page
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100vh',
        width: drawerWidth,
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 6, fontSize: '1.5rem' }}>
        SellScaleHood
      </Typography>

      {/* Menu List */}
      <List>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.25rem' }}>
          Menu
        </Typography>
        {/* Overview */}
        <ListItem button onClick={() => navigate('/overview')} sx={{ cursor: 'pointer' }}>
          <ListItemIcon>
            <HomeIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '1.2rem' }} primary="Overview" />
        </ListItem>
        
        {/* Portfolio */}
        <ListItem button onClick={() => navigate('/portfolio')} sx={{ cursor: 'pointer' }}>
          <ListItemIcon>
            <AccountBalanceIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '1.2rem' }} primary="Portfolio" />
        </ListItem>

        {/* Stock Market */}
        <ListItem button onClick={() => navigate('/stock-market')} sx={{ cursor: 'pointer' }}>
          <ListItemIcon>
            <BarChartIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '1.2rem' }} primary="Stock Market" />
        </ListItem>

        {/* Transactions */}
        <ListItem button onClick={() => navigate('/transaction')} sx={{ cursor: 'pointer' }}>
          <ListItemIcon>
            <SwapHorizIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '1.2rem' }} primary="Transaction" />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <List>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.25rem' }}>
          General
        </Typography>
        <ListItem button onClick={() => navigate('/settings')} sx={{ cursor: 'pointer' }}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '1.2rem' }} primary="Settings" />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>A</Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontSize: '1rem' }}>Aria Liang</Typography>
          <Typography variant="body2">aria@example.com</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'secondary.main' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            SellScaleHood
          </Typography>
          {/* Logout Button */}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'primary.main',
          },
          display: drawerOpen || isMdOrBelow ? 'block' : 'none',
        }}
        variant={isMdOrBelow ? 'temporary' : 'persistent'} // Temporary on small screens, persistent on large
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer} // Only applicable when temporary
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Placeholder for AppBar height */}
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;

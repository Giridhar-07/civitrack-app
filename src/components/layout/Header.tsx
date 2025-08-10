import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  ExitToApp, 
  Dashboard, 
  ReportProblem,
  Search as SearchIcon,
  Map as MapIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    authService.logout();
    onLogout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: '#222',
          color: '#fff',
        }
      }}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <ListItemIcon>
          <AccountCircle fontSize="small" sx={{ color: '#fff' }} />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      
      {user?.isAdmin && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
          <ListItemIcon>
            <Dashboard fontSize="small" sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText>Admin Dashboard</ListItemText>
        </MenuItem>
      )}
      
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" sx={{ color: '#fff' }} />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      PaperProps={{
        sx: {
          backgroundColor: '#222',
          color: '#fff',
          width: 240
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CiviTrack
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: '#444' }} />
      <List>
        <ListItem button component={RouterLink} to="/" onClick={toggleMobileMenu}>
          <ListItemIcon>
            <HomeIcon sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/map" onClick={toggleMobileMenu}>
          <ListItemIcon>
            <MapIcon sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText primary="Map View" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/report" onClick={toggleMobileMenu}>
          <ListItemIcon>
            <ReportProblem sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText primary="Report Issue" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/search" onClick={toggleMobileMenu}>
          <ListItemIcon>
            <SearchIcon sx={{ color: '#fff' }} />
          </ListItemIcon>
          <ListItemText primary="Search Issues" />
        </ListItem>
      </List>
      
      <Divider sx={{ backgroundColor: '#444' }} />
      
      {user ? (
        <List>
          <ListItem button component={RouterLink} to="/profile" onClick={toggleMobileMenu}>
            <ListItemIcon>
              <AccountCircle sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          
          {user.isAdmin && (
            <ListItem button component={RouterLink} to="/admin" onClick={toggleMobileMenu}>
              <ListItemIcon>
                <Dashboard sx={{ color: '#fff' }} />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
          )}
          
          <ListItem button onClick={() => { toggleMobileMenu(); handleLogout(); }}>
            <ListItemIcon>
              <ExitToApp sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={RouterLink} to="/login" onClick={toggleMobileMenu}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={RouterLink} to="/register" onClick={toggleMobileMenu}>
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      )}
    </Drawer>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#000' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            CiviTrack
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                sx={{ mx: 1 }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/map"
                sx={{ mx: 1 }}
              >
                Map View
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/report"
                sx={{ mx: 1 }}
              >
                Report Issue
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/search"
                sx={{ mx: 1 }}
              >
                Search
              </Button>
            </Box>
          )}
          
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50' }}>
                  {(user?.username?.[0] ?? user?.name?.[0] ?? '?').toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mx: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  mx: 1, 
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {renderMenu}
      {mobileMenu}
    </Box>
  );
};

export default Header;
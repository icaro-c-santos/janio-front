import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: colors.primary.main,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Botão do menu (apenas em mobile) */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo/Título */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: colors.primary.contrastText,
          }}
        >
          Janio ERP
        </Typography>

        {/* Informações do usuário */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: colors.primary.contrastText,
              opacity: 0.9,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {user?.name}
          </Typography>
          
          <Typography
            variant="caption"
            sx={{
              color: colors.primary.contrastText,
              opacity: 0.8,
              display: { xs: 'none', md: 'block' }
            }}
          >
            {isAdmin() ? 'Administrador' : 'Cliente'}
          </Typography>

          {/* Avatar/Botão do perfil */}
          <IconButton
            size="large"
            edge="end"
            aria-label="conta do usuário"
            aria-controls={isMenuOpen ? 'primary-search-account-menu' : undefined}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: colors.primary.light,
                color: colors.primary.contrastText,
              }}
            >
              <AccountCircle />
            </Avatar>
          </IconButton>
        </Box>

        {/* Menu do perfil */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircle sx={{ color: colors.text.secondary }} />
              <Typography variant="body2">Perfil</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LogoutIcon sx={{ color: colors.text.secondary }} />
              <Typography variant="body2">Sair</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

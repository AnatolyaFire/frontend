import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Button, DialogTitle, DialogContent, DialogActions, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import logo from '/logo.png';

function NavBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isMenuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  // Обработчики событий
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    localStorage.removeItem('access_token');
    navigate('/app/login');
  };

  const handlePhoneDialogClose = () => {
    setPhoneDialogOpen(false);
  };

  // Обработчики для перемещения окна
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  }, [isDragging, offset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleLoginClick}>Выход</MenuItem>
    </Menu>
  );

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#03223b' }}>
          <Toolbar>
            <a href='/app/'><img src={logo} alt="Logo" style={{ height: '25px', marginRight: '16px' }} /></a>
            <Typography variant="h1" noWrap sx={{ fontWeight: '800', fontSize: "25px", display: { xs: 'none', sm: 'block' } }}>
              MP Hub
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
        {renderMenu}
      </Box>

      {/* Модальное окно для контактной информации */}
      {phoneDialogOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300,
          }}
          onClick={handlePhoneDialogClose} // Закрытие по клику вне окна
        >
          <Paper
            ref={dialogRef}
            elevation={8}
            onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на само окно
            sx={{
              backgroundColor: '#03223b',
              color: 'white',
              width: isMobile ? '95%' : '400px', // Адаптивная ширина
              maxWidth: '95vw',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`
            }}
          >
            <DialogTitle
              onMouseDown={handleMouseDown}
              sx={{
                cursor: 'move',
                bgcolor: 'primary.main',
                color: 'white',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '12px 16px',
                fontSize: '1.1rem'
              }}
            >
              Контактная информация
            </DialogTitle>

            <DialogContent sx={{ padding: '16px' }}>

            </DialogContent>

            <DialogActions sx={{ padding: '8px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <Button
                onClick={handlePhoneDialogClose}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Закрыть
              </Button>
            </DialogActions>
          </Paper>
        </Box>
      )}
    </React.Fragment>
  );
}

export default NavBar;
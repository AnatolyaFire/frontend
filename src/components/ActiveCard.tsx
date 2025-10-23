import React from 'react';
import { Paper, Box, Typography, SvgIconProps } from '@mui/material';


interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactElement<SvgIconProps> | React.ReactNode;
  onClick?: () => void;
  gradient?: string;
  iconBackground?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'light';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  onClick,
  variant = 'primary'
}) => {
  // Цветовые схемы на основе вашей палитры
  const colorSchemes = {
    primary: {
      gradient: 'linear-gradient(135deg, #00233a 0%, #1a3d5c 100%)',
      iconBackground: 'linear-gradient(45deg, #00233a, #405a6b)',
      textColor: '#ffffff',
      hoverGradient: 'linear-gradient(135deg, #1a3d5c 0%, #2a4d6c 100%)',
      borderColor: '#00233a'
    },
    secondary: {
      gradient: 'linear-gradient(135deg, #f00521 0%, #ff3366 100%)',
      iconBackground: 'linear-gradient(45deg, #f00521, #ff6b8b)',
      textColor: '#ffffff',
      hoverGradient: 'linear-gradient(135deg, #ff3366 0%, #ff6b8b 100%)',
      borderColor: '#f00521'
    },
    accent: {
      gradient: 'linear-gradient(135deg, #405a6b 0%, #5a768b 100%)',
      iconBackground: 'linear-gradient(45deg, #405a6b, #6a869b)',
      textColor: '#ffffff',
      hoverGradient: 'linear-gradient(135deg, #5a768b 0%, #6a869b 100%)',
      borderColor: '#405a6b'
    },
    light: {
      gradient: 'linear-gradient(135deg, #bfc8ce 0%, #d9e0e6 100%)',
      iconBackground: 'linear-gradient(45deg, #bfc8ce, #d9e0e6)',
      textColor: '#00233a',
      hoverGradient: 'linear-gradient(135deg, #d9e0e6 0%, #e8edf2 100%)',
      borderColor: '#bfc8ce'
    }
  };

  const colors = colorSchemes[variant];

  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '16px',
        minHeight: '160px',
        padding: '24px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: colors.gradient,
        position: 'relative',
        overflow: 'hidden',
        border: `2px solid ${colors.borderColor}20`, // 20% прозрачности
        '&:hover': onClick ? {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 32px rgba(0, 35, 58, 0.25)',
          background: colors.hoverGradient,
          borderColor: `${colors.borderColor}40`, // 40% прозрачности при hover
          '& .icon-container': {
            transform: 'scale(1.15) rotate(5deg)'
          }
        } : {}
      }}
    >
      {/* Декоративный элемент */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          background: colors.iconBackground,
          borderRadius: '50%',
          opacity: 0.08,
          transition: 'all 0.3s ease'
        }}
      />

      {/* Иконка */}
      <Box
        className="icon-container"
        sx={{
          width: 70,
          height: 70,
          borderRadius: '18px',
          background: colors.iconBackground,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 3,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon, {
            sx: {
              color: colors.textColor,
              fontSize: 32,
              transition: 'all 0.3s ease'
            }
          })
          : icon
        }
      </Box>

      {/* Текст */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: colors.textColor,
          textAlign: 'center',
          mb: subtitle ? 1 : 0,
          fontSize: '1.1rem',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {title}
      </Typography>

      {/* Подзаголовок (опционально) */}
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: `${colors.textColor}CC`, // 80% прозрачности
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 400,
            position: 'relative',
            zIndex: 2
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};


export default DashboardCard;
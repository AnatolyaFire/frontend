import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface SimpleDashboardCardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const SimpleDashboardCard: React.FC<SimpleDashboardCardProps> = ({
  title,
  icon,
  onClick
}) => {
  return (
    <Paper
      elevation={3}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        minHeight: '140px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.18)'
        }
      }}
    >
      <Box sx={{ mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
        {title}
      </Typography>
    </Paper>
  );
};

export default SimpleDashboardCard;
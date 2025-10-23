import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '/BhGpt.jpg';
import { keyframes, styled } from '@mui/system';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface RotatingLogoProps {
  isLoading: boolean;
}

const RotatingLogo = styled('img')<RotatingLogoProps>(({ isLoading }) => ({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  animation: isLoading ? `${rotate} 2s linear infinite` : 'none',
}));

function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
    if (info) setInfo(null);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError(null);
    if (info) setInfo(null);
  };

  const requestCode = async () => {
    if (!email.trim()) {
      setError('Пожалуйста, введите ваш email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfo(null);

    try {
      await axios.post('http://45.144.178.5/api/generate_code', { user_email: email });
      setInfo('Код подтверждения отправлен на ваш email. Проверьте папку «Входящие» или «Спам».');
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось отправить код. Обратитесь в техподдержку.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError('Пожалуйста, введите код из письма.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await axios.post('http://45.144.178.5/api/token', { user_email: email, code });
      const { access_token, token_type } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_type', token_type);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный код. Проверьте и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (step === 'email') requestCode();
    else verifyCode();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) handleSubmit();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Paper
        sx={{
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': { transform: 'scale(1.02)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <RotatingLogo src={logo} alt="Логотип" isLoading={isLoading} />
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          {step === 'email' ? 'Вход по Email' : 'Введите код из письма'}
        </Typography>

        {/* Алерты */}
        {info && (
          <Alert
            variant="outlined"
            severity="info"
            sx={{
              mb: 2,
              borderColor: '#00233a',
              color: '#00233a',       
              backgroundColor: '#f0f4f8' 
            }}
          >
            {info}
          </Alert>
        )}
        {error && (
          <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Поля ввода */}
        {step === 'email' ? (
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            margin="normal"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            disabled={isLoading}
            autoComplete="email"
          />
        ) : (
          <TextField
            fullWidth
            label="Код из письма"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            margin="normal"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            disabled={isLoading}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            marginTop: '16px',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
            '&:hover': {
              background: 'linear-gradient(50deg, var(--color-secondary) 0%, var(--color-accent) 100%)',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : step === 'email' ? 'Получить код' : 'Войти'}
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;

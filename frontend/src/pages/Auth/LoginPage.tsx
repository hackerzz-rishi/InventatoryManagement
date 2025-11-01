import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '@/context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(form.username, form.password);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5">
              Sign in to your account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                required
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                disabled={isLoading}
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography color="primary">
                    Don't have an account? Register
                  </Typography>
                </Link>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
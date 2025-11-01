import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledLink = styled(Link)({
  color: '#1976d2', // Material-UI primary color
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAuth } from '@/context/AuthContext';


interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  role_id: string;
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    role_id: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = form;
      await register(registrationData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
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
          alignItems: 'center',
          mb: 8
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
              <PersonAddOutlinedIcon sx={{ color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5">
              Create your account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
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
                id="email"
                name="email"
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
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
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <TextField
                select
                fullWidth
                id="role_id"
                name="role_id"
                label="Role"
                required
                value={form.role_id}
                onChange={handleChange}
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="ROLE_OFFICE">Office Staff</MenuItem>
                <MenuItem value="ROLE_SALES">Sales Staff</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <StyledLink to="/login">
                  Sign in
                </StyledLink>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;

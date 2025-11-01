import React from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Welcome, {user?.username}!
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Recent Sales
          </Typography>
          <Typography>
            Quick access to your latest sales transactions
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Recent Purchases
          </Typography>
          <Typography>
            View your recent purchase orders
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Stock Status
          </Typography>
          <Typography>
            Overview of your current inventory levels
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard;
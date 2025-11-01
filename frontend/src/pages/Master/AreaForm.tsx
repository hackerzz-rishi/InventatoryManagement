import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

interface AreaFormData {
  area_name: string;
}

const AreaForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AreaFormData>({
    area_name: ''
  });

  useEffect(() => {
    const loadArea = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/master/areas/${id}`);
          const areaData = response.data.data;
          setFormData({
            area_name: areaData.area_name
          });
        } catch (error: any) {
          showNotification(
            error.response?.data?.message || 'Error loading area',
            'error'
          );
          navigate('/master/areas');
        } finally {
          setLoading(false);
        }
      }
    };

    loadArea();
  }, [id, navigate, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/master/areas/${id}`, formData);
        showNotification('Area updated successfully', 'success');
      } else {
        await apiClient.post('/master/areas', formData);
        showNotification('Area created successfully', 'success');
      }
      navigate('/master/areas');
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || `Error ${id ? 'updating' : 'creating'} area`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? 'Edit Area' : 'Add New Area'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Area Name"
            name="area_name"
            value={formData.area_name}
            onChange={handleChange}
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/master/areas')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AreaForm;
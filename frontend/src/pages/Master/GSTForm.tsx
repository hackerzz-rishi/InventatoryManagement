import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

interface GSTFormData {
  gst_percentage: number;
  description: string;
}

const GSTForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GSTFormData>({
    gst_percentage: 0,
    description: ''
  });

  useEffect(() => {
    const loadGST = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/master/gst/${id}`);
          const gstData = response.data.data;
          setFormData({
            gst_percentage: gstData.gst_percentage,
            description: gstData.description || ''
          });
        } catch (error: any) {
          showNotification(
            error.response?.data?.message || 'Error loading GST rate',
            'error'
          );
          navigate('/master/gst');
        } finally {
          setLoading(false);
        }
      }
    };

    loadGST();
  }, [id, navigate, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gst_percentage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/master/gst/${id}`, formData);
        showNotification('GST rate updated successfully', 'success');
      } else {
        await apiClient.post('/master/gst', formData);
        showNotification('GST rate created successfully', 'success');
      }
      navigate('/master/gst');
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || `Error ${id ? 'updating' : 'creating'} GST rate`,
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
          {id ? 'Edit GST Rate' : 'Add New GST Rate'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            type="number"
            label="GST Percentage"
            name="gst_percentage"
            value={formData.gst_percentage}
            onChange={handleChange}
            margin="normal"
            inputProps={{
              step: "0.01",
              min: "0",
              max: "100"
            }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
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
              onClick={() => navigate('/master/gst')}
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

export default GSTForm;
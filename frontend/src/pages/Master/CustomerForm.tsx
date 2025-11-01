import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { ICustomerMaster } from '../../types/entities';

interface CustomerFormData {
  customer_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
}

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gst_number: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const loadCustomer = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/master/customers/${id}`);
          const customerData = response.data.data;
          setFormData({
            customer_name: customerData.customer_name,
            contact_person: customerData.contact_person || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            address: customerData.address || '',
            gst_number: customerData.gst_number || ''
          });
        } catch (error: any) {
          showNotification(
            error.response?.data?.message || 'Error loading customer',
            'error'
          );
          navigate('/master/customers');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCustomer();
  }, [id, navigate, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/master/customers/${id}`, formData);
        showNotification('Customer updated successfully', 'success');
      } else {
        await apiClient.post('/master/customers', formData);
        showNotification('Customer created successfully', 'success');
      }
      navigate('/master/customers');
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || `Error ${id ? 'updating' : 'creating'} customer`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          {id ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contact Person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="GST Number"
            name="gst_number"
            value={formData.gst_number}
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
              onClick={() => navigate('/master/customers')}
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

export default CustomerForm;
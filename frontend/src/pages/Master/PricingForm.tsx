import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

interface PricingFormData {
  product_id: string;
  base_price: number;
  gst_id: string;
  effective_from: string;
  effective_to: string;
}

interface Product {
  product_id: string;
  product_name: string;
}

interface GST {
  gst_id: string;
  gst_percentage: number;
  description: string;
}

const PricingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [gstRates, setGSTRates] = useState<GST[]>([]);
  const [formData, setFormData] = useState<PricingFormData>({
    product_id: '',
    base_price: 0,
    gst_id: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: ''
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [productsResponse, gstResponse] = await Promise.all([
          apiClient.get('/master/products'),
          apiClient.get('/master/gst')
        ]);
        setProducts(productsResponse.data.data);
        setGSTRates(gstResponse.data.data);
      } catch (error: any) {
        showNotification('Error loading master data', 'error');
      }
    };

    loadMasterData();
  }, [showNotification]);

  useEffect(() => {
    const loadPricing = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/master/pricing/${id}`);
          const pricingData = response.data.data;
          setFormData({
            product_id: pricingData.product_id,
            base_price: pricingData.base_price,
            gst_id: pricingData.gst_id,
            effective_from: pricingData.effective_from.split('T')[0],
            effective_to: pricingData.effective_to ? pricingData.effective_to.split('T')[0] : ''
          });
        } catch (error: any) {
          showNotification(
            error.response?.data?.message || 'Error loading pricing',
            'error'
          );
          navigate('/master/pricing');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPricing();
  }, [id, navigate, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: name === 'base_price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/master/pricing/${id}`, formData);
        showNotification('Pricing updated successfully', 'success');
      } else {
        await apiClient.post('/master/pricing', formData);
        showNotification('Pricing created successfully', 'success');
      }
      navigate('/master/pricing');
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || `Error ${id ? 'updating' : 'creating'} pricing`,
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
          {id ? 'Edit Pricing' : 'Add New Pricing'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="product-label">Product</InputLabel>
            <Select
              labelId="product-label"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              label="Product"
              required
            >
              {products.map((product) => (
                <MenuItem key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            type="number"
            label="Base Price"
            name="base_price"
            value={formData.base_price}
            onChange={handleChange}
            margin="normal"
            inputProps={{
              step: "0.01",
              min: "0"
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="gst-label">GST Rate</InputLabel>
            <Select
              labelId="gst-label"
              name="gst_id"
              value={formData.gst_id}
              onChange={handleChange}
              label="GST Rate"
              required
            >
              {gstRates.map((gst) => (
                <MenuItem key={gst.gst_id} value={gst.gst_id}>
                  {gst.gst_percentage}% - {gst.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            type="date"
            label="Effective From"
            name="effective_from"
            value={formData.effective_from}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            type="date"
            label="Effective To"
            name="effective_to"
            value={formData.effective_to}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
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
              onClick={() => navigate('/master/pricing')}
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

export default PricingForm;
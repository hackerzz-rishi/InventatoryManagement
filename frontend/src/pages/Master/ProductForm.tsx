import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

interface ProductFormData {
  product_name: string;
  description: string;
  unit: string;
  stock_quantity: number;
  reorder_level: number;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    description: '',
    unit: '',
    stock_quantity: 0,
    reorder_level: 0
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await apiClient.get(`/master/products/${id}`);
          const productData = response.data.data;
          setFormData({
            product_name: productData.product_name,
            description: productData.description || '',
            unit: productData.unit,
            stock_quantity: productData.stock_quantity || 0,
            reorder_level: productData.reorder_level || 0
          });
        } catch (error: any) {
          showNotification(
            error.response?.data?.message || 'Error loading product',
            'error'
          );
          navigate('/master/products');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProduct();
  }, [id, navigate, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock_quantity' || name === 'reorder_level' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/master/products/${id}`, formData);
        showNotification('Product updated successfully', 'success');
      } else {
        await apiClient.post('/master/products', formData);
        showNotification('Product created successfully', 'success');
      }
      navigate('/master/products');
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || `Error ${id ? 'updating' : 'creating'} product`,
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
          {id ? 'Edit Product' : 'Add New Product'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Product Name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            type="number"
            label="Stock Quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            type="number"
            label="Reorder Level"
            name="reorder_level"
            value={formData.reorder_level}
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
              onClick={() => navigate('/master/products')}
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

export default ProductForm;
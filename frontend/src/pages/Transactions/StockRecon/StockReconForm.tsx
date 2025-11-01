import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StockRecon } from '../../../types/transactions';
import { createStockRecon } from '../../../api/transactions';
import { useMasterData } from '../../../hooks/useMasterData';
import { Alert } from '../../../components/Alert';

interface StockReconFormData extends Omit<StockRecon, 'recon_id' | 'created_at' | 'updated_at'> {
}

const initialFormData: StockReconFormData = {
  product_id: 0,
  current_quantity: 0,
  actual_quantity: 0,
  difference: 0,
  adjustment_reason: '',
  notes: ''
};

const StockReconForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StockReconFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { products, loading: masterLoading, error: masterError } = useMasterData();

  const handleProductChange = (productId: number) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        product_id: productId,
        current_quantity: 0, // This should be fetched from the API
        actual_quantity: 0,
        difference: 0
      }));
    }
  };

  const handleActualQuantityChange = (quantity: number) => {
    setFormData(prev => ({
      ...prev,
      actual_quantity: quantity,
      difference: quantity - prev.current_quantity
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStockRecon(formData);
      navigate('/transactions/stock-recon');
    } catch (error) {
      console.error('Error creating stock reconciliation:', error);
      setError('Error creating stock reconciliation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (masterLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (masterError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading data. Please try again later.
        </Typography>
        <Button onClick={() => navigate('/transactions/stock-recon')}>
          Back to Stock Reconciliation List
        </Button>
      </Box>
    );
  }

  return (
    <Box component={Paper} p={3}>
      <Alert
        open={error !== null}
        message={error || ''}
        severity="error"
        onClose={() => setError(null)}
      />

      <Typography variant="h5" gutterBottom>
        New Stock Reconciliation
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex={1} minWidth="300px">
              <TextField
                select
                required
                fullWidth
                label="Product"
                value={formData.product_id}
                onChange={(e) => handleProductChange(Number(e.target.value))}
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box flex={1} minWidth="300px">
              <TextField
                required
                fullWidth
                type="number"
                label="Current Quantity"
                value={formData.current_quantity}
                disabled
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <TextField
                required
                fullWidth
                type="number"
                label="Actual Quantity"
                value={formData.actual_quantity}
                onChange={(e) => handleActualQuantityChange(Number(e.target.value))}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <TextField
                fullWidth
                type="number"
                label="Difference"
                value={formData.difference}
                disabled
              />
            </Box>
          </Box>
          
          <TextField
            required
            fullWidth
            multiline
            rows={3}
            label="Adjustment Reason"
            value={formData.adjustment_reason}
            onChange={(e) => setFormData(prev => ({ ...prev, adjustment_reason: e.target.value }))}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </Stack>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/transactions/stock-recon')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || masterLoading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default StockReconForm;
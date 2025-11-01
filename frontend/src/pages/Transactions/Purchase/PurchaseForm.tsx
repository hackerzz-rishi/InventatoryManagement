import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Grid
} from '@mui/material';
import { Alert } from '../../../components/Alert';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Purchase, PurchaseDetail } from '../../../types/transactions';
import { createPurchase } from '../../../api/transactions';
import { useMasterData } from '../../../hooks/useMasterData';
import { useNotification } from '../../../context/NotificationContext';

interface PurchaseFormData extends Omit<Purchase, 'purchase_id' | 'created_at' | 'updated_at'> {
  details: PurchaseDetail[];
}

const initialFormData: PurchaseFormData = {
  supplier_id: 0,
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  total_amount: 0,
  gst_amount: 0,
  net_amount: 0,
  notes: '',
  details: []
};

const initialDetailRow: PurchaseDetail = {
  product_id: 0,
  quantity: 0,
  unit_price: 0,
  gst_rate: 0,
  gst_amount: 0,
  total_amount: 0
};

const PurchaseForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PurchaseFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { products, loading: masterLoading, error: masterError } = useMasterData();
  
  const calculateAmounts = (details: PurchaseDetail[]) => {
    let totalAmount = 0;
    let totalGst = 0;

    details.forEach(detail => {
      const lineTotal = detail.quantity * detail.unit_price;
      const lineGst = (lineTotal * detail.gst_rate) / 100;
      detail.gst_amount = lineGst;
      detail.total_amount = lineTotal + lineGst;
      totalAmount += lineTotal;
      totalGst += lineGst;
    });

    return {
      total_amount: totalAmount,
      gst_amount: totalGst,
      net_amount: totalAmount + totalGst,
      details
    };
  };

  const handleDetailChange = (index: number, field: keyof PurchaseDetail, value: number) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };

    const amounts = calculateAmounts(newDetails);
    setFormData(prev => ({
      ...prev,
      ...amounts
    }));
  };

  const handleAddDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { ...initialDetailRow }]
    }));
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    const amounts = calculateAmounts(newDetails);
    setFormData(prev => ({
      ...prev,
      ...amounts
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPurchase(formData);
      navigate('/transactions/purchase');
    } catch (error) {
      console.error('Error creating purchase:', error);
      setError('Error creating purchase. Please try again.');
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
        <Button onClick={() => navigate('/transactions/purchase')}>
          Back to Purchase List
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
        New Purchase
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex={1} minWidth="300px">
              <TextField
                required
                fullWidth
                label="Supplier ID"
                type="number"
                value={formData.supplier_id}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: Number(e.target.value) }))}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <TextField
                required
                fullWidth
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <TextField
                required
                fullWidth
                type="date"
                label="Invoice Date"
                value={formData.invoice_date}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            Products
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>GST Rate (%)</TableCell>
                  <TableCell>GST Amount</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={detail.product_id}
                        onChange={(e) => handleDetailChange(index, 'product_id', Number(e.target.value))}
                      >
                        {products.map(product => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleDetailChange(index, 'quantity', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={detail.unit_price}
                        onChange={(e) => handleDetailChange(index, 'unit_price', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={detail.gst_rate}
                        onChange={(e) => handleDetailChange(index, 'gst_rate', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>{detail.gst_amount.toFixed(2)}</TableCell>
                    <TableCell>{detail.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveDetail(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddDetail}
            sx={{ mt: 2 }}
          >
            Add Product
          </Button>
        </Box>

          <Box width="100%">
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
          <Box display="flex" gap={3}>
            <Box flex={1}>
              <TextField
                fullWidth
                disabled
                label="Total Amount"
                value={formData.total_amount.toFixed(2)}
              />
            </Box>
            <Box flex={1}>
              <TextField
                fullWidth
                disabled
                label="GST Amount"
                value={formData.gst_amount.toFixed(2)}
              />
            </Box>
            <Box flex={1}>
              <TextField
                fullWidth
                disabled
                label="Net Amount"
                value={formData.net_amount.toFixed(2)}
              />
            </Box>
          </Box>
        </Stack>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/transactions/purchase')}
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

export default PurchaseForm;
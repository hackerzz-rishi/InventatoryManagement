import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Sale, SalesDetail } from '../../../types/transactions';
import { createSale, getSale, updateSale } from '../../../api/transactions';
import { useMasterData } from '../../../hooks/useMasterData';
import { Alert } from '../../../components/Alert';
import { salesFormSchema } from '../../../validations/sales.validation';
import { useNotification } from '../../../context/NotificationContext';
import { ValidationError } from 'yup';

interface FormErrors {
  [key: string]: string;
}

interface SaleFormData extends Omit<Sale, 'sales_id' | 'created_at' | 'updated_at'> {
  details: SalesDetail[];
}

const initialFormData: SaleFormData = {
  customer_id: 0,
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  total_amount: 0,
  gst_amount: 0,
  net_amount: 0,
  notes: '',
  details: []
};

const initialDetailRow: SalesDetail = {
  product_id: 0,
  quantity: 0,
  unit_price: 0,
  gst_rate: 0,
  gst_amount: 0,
  total_amount: 0
};

const getValidationErrors = (error: ValidationError): FormErrors => {
  const errors: FormErrors = {};
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  return errors;
};

const SalesForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<SaleFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { customers, products, loading: masterLoading, error: masterError } = useMasterData();

  useEffect(() => {
    const loadSale = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await getSale(parseInt(id, 10));
          if (response.data) {
            const { sales_id, created_at, updated_at, ...saleData } = response.data;
            setFormData(saleData as SaleFormData);
          }
        } catch (error) {
          if (error instanceof Error) {
            showNotification(error.message, 'error');
          }
          navigate('/transactions/sales');
        } finally {
          setLoading(false);
        }
      }
    };

    loadSale();
  }, [id, navigate, showNotification]);

  const calculateAmounts = (details: SalesDetail[]) => {
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

  const handleDetailChange = (index: number, field: keyof SalesDetail, value: number) => {
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
    setSubmitError(null);
    setErrors({});

    try {
      await salesFormSchema.validate(formData, { abortEarly: false });

      if (id) {
        await updateSale(parseInt(id, 10), formData);
        showNotification('Sale updated successfully', 'success');
      } else {
        await createSale(formData);
        showNotification('Sale created successfully', 'success');
      }
      navigate('/transactions/sales');
    } catch (error) {
      if (error instanceof ValidationError) {
        const validationErrors = getValidationErrors(error);
        setErrors(validationErrors);
        setSubmitError('Please fix the validation errors');
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unexpected error occurred');
      }
      console.error('Error saving sale:', error);
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
        <Button onClick={() => navigate('/transactions/sales')}>
          Back to Sales List
        </Button>
      </Box>
    );
  }

  return (
    <Box component={Paper} p={3}>
      <Alert
        open={submitError !== null}
        message={submitError || ''}
        severity="error"
        onClose={() => setSubmitError(null)}
      />

      <Typography variant="h5" gutterBottom>
        New Sale
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexWrap="wrap" gap={3}>
            <Box width="calc(50% - 12px)">
              <TextField
                select
                required
                fullWidth
                label="Customer"
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: Number(e.target.value) }))}
                error={!!errors.customer_id}
                helperText={errors.customer_id}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box width="calc(50% - 12px)">
              <TextField
                required
                fullWidth
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                error={!!errors.invoice_number}
                helperText={errors.invoice_number}
              />
            </Box>
            <Box width="calc(50% - 12px)">
              <TextField
                required
                fullWidth
                type="date"
                label="Invoice Date"
                value={formData.invoice_date}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                error={!!errors.invoice_date}
                helperText={errors.invoice_date}
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

        <Box display="flex" flexDirection="column" gap={3}>
          <Box>
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
        </Box>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/transactions/sales')}
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

export default SalesForm;
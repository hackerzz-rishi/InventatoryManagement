import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSale } from '../../../api/transactions';
import { Sale } from '../../../types/transactions';
import { Alert } from '../../../components/Alert';
import { Grid } from '../../../components/Grid';
import { useMasterData } from '../../../hooks/useMasterData';

const SalesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customers, products, loading: masterLoading, error: masterError } = useMasterData();

  useEffect(() => {
    const loadSale = async () => {
      try {
        if (id) {
          const response = await getSale(Number(id));
          setSale(response.data);
        }
      } catch (error) {
        console.error('Error loading sale:', error);
        setError('Error loading sale details.');
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id]);

  if (loading || masterLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || masterError || !sale) {
    return (
      <Box p={3}>
        <Typography color="error">
          {error || masterError || 'Sale not found.'}
        </Typography>
        <Button onClick={() => navigate('/transactions/sales')}>
          Back to Sales List
        </Button>
      </Box>
    );
  }

  const customer = customers.find(c => c.id === sale.customer_id);

  return (
    <Box component={Paper} p={3}>
      <Alert
        open={error !== null}
        message={error || ''}
        severity="error"
        onClose={() => setError(null)}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Sale Details
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/transactions/sales')}
        >
          Back to List
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Customer
          </Typography>
          <Typography variant="body1">
            {customer?.name || `Customer ID: ${sale.customer_id}`}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Number
          </Typography>
          <Typography variant="body1">
            {sale.invoice_number}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Date
          </Typography>
          <Typography variant="body1">
            {new Date(sale.invoice_date).toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Created At
          </Typography>
          <Typography variant="body1">
            {new Date(sale.created_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Products
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">GST Rate</TableCell>
              <TableCell align="right">GST Amount</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale.details.map((detail, index) => {
              const product = products.find(p => p.id === detail.product_id);
              return (
                <TableRow key={index}>
                  <TableCell>{product?.name || `Product ID: ${detail.product_id}`}</TableCell>
                  <TableCell align="right">{detail.quantity}</TableCell>
                  <TableCell align="right">{detail.unit_price.toFixed(2)}</TableCell>
                  <TableCell align="right">{detail.gst_rate}%</TableCell>
                  <TableCell align="right">{detail.gst_amount.toFixed(2)}</TableCell>
                  <TableCell align="right">{detail.total_amount.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3}>
        <Grid container spacing={3} justifyContent="flex-end">
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography variant="h6">
              ₹{sale.total_amount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              GST Amount
            </Typography>
            <Typography variant="h6">
              ₹{sale.gst_amount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Net Amount
            </Typography>
            <Typography variant="h6">
              ₹{sale.net_amount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {sale.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="textSecondary">
            Notes
          </Typography>
          <Typography variant="body1">
            {sale.notes}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default SalesDetail;
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
import { getPurchase } from '../../../api/transactions';
import { Purchase } from '../../../types/transactions';
import { Alert } from '../../../components/Alert';
import { Grid } from '../../../components/Grid';
import { useMasterData } from '../../../hooks/useMasterData';

const PurchaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products, loading: masterLoading, error: masterError } = useMasterData();

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        if (id) {
          const response = await getPurchase(Number(id));
          setPurchase(response.data);
        }
      } catch (error) {
        console.error('Error loading purchase:', error);
        setError('Error loading purchase details.');
      } finally {
        setLoading(false);
      }
    };

    loadPurchase();
  }, [id]);

  if (loading || masterLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || masterError || !purchase) {
    return (
      <Box p={3}>
        <Typography color="error">
          {error || masterError || 'Purchase not found.'}
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Purchase Details
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/transactions/purchase')}
        >
          Back to List
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Supplier ID
          </Typography>
          <Typography variant="body1">
            {purchase.supplier_id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Number
          </Typography>
          <Typography variant="body1">
            {purchase.invoice_number}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Date
          </Typography>
          <Typography variant="body1">
            {new Date(purchase.invoice_date).toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Created At
          </Typography>
          <Typography variant="body1">
            {new Date(purchase.created_at).toLocaleString()}
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
            {purchase.details.map((detail, index) => {
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
              ₹{purchase.total_amount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              GST Amount
            </Typography>
            <Typography variant="h6">
              ₹{purchase.gst_amount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Net Amount
            </Typography>
            <Typography variant="h6">
              ₹{purchase.net_amount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {purchase.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="textSecondary">
            Notes
          </Typography>
          <Typography variant="body1">
            {purchase.notes}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default PurchaseDetail;
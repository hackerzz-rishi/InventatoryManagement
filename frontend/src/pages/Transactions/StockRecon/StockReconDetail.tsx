import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getStockRecon } from '../../../api/transactions';
import { StockRecon } from '../../../types/transactions';
import { Alert } from '../../../components/Alert';
import { Grid } from '../../../components/Grid';
import { useMasterData } from '../../../hooks/useMasterData';

const StockReconDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recon, setRecon] = useState<StockRecon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products, loading: masterLoading, error: masterError } = useMasterData();

  useEffect(() => {
    const loadRecon = async () => {
      try {
        if (id) {
          const response = await getStockRecon(Number(id));
          setRecon(response.data);
        }
      } catch (error) {
        console.error('Error loading stock reconciliation:', error);
        setError('Error loading stock reconciliation details.');
      } finally {
        setLoading(false);
      }
    };

    loadRecon();
  }, [id]);

  if (loading || masterLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || masterError || !recon) {
    return (
      <Box p={3}>
        <Typography color="error">
          {error || masterError || 'Stock reconciliation not found.'}
        </Typography>
        <Button onClick={() => navigate('/transactions/stock-recon')}>
          Back to Stock Reconciliation List
        </Button>
      </Box>
    );
  }

  const product = products.find(p => p.id === recon.product_id);

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
          Stock Reconciliation Details
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/transactions/stock-recon')}
        >
          Back to List
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Product
          </Typography>
          <Typography variant="body1">
            {product?.name || `Product ID: ${recon.product_id}`}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Current Quantity
          </Typography>
          <Typography variant="body1">
            {recon.current_quantity}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Actual Quantity
          </Typography>
          <Typography variant="body1">
            {recon.actual_quantity}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Difference
          </Typography>
          <Typography variant="body1" color={recon.difference < 0 ? 'error' : undefined}>
            {recon.difference}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Adjustment Reason
          </Typography>
          <Typography variant="body1">
            {recon.adjustment_reason}
          </Typography>
        </Grid>
      </Grid>

      {recon.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="textSecondary">
            Notes
          </Typography>
          <Typography variant="body1">
            {recon.notes}
          </Typography>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Created At
          </Typography>
          <Typography variant="body1">
            {new Date(recon.created_at).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Last Updated
          </Typography>
          <Typography variant="body1">
            {new Date(recon.updated_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockReconDetail;
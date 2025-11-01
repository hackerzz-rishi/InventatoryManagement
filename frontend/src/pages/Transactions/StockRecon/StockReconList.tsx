import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  TableSortLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete, Visibility, Edit } from '@mui/icons-material';
import { StockRecon } from '../../../types/transactions';
import { getStockRecons, deleteStockRecon } from '../../../api/transactions';
import { useNotification } from '../../../context/NotificationContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ListFilters from '../../../components/ListFilters';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: keyof StockRecon;
  direction: SortDirection;
}

interface FilterValue {
  [key: string]: string | number | { start: string; end: string } | null;
}

const StockReconList: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [recons, setRecons] = useState<StockRecon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reconToDelete, setReconToDelete] = useState<StockRecon | null>(null);
  const [sort, setSort] = useState<SortConfig>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<FilterValue>({
    search: null,
    date_range: null,
    product_id: null
  });

  const handleDelete = (recon: StockRecon) => {
    setReconToDelete(recon);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reconToDelete) return;

    try {
      await deleteStockRecon(reconToDelete.recon_id);
      showNotification('Stock reconciliation deleted successfully', 'success');
      setRecons(prev => prev.filter(r => r.recon_id !== reconToDelete.recon_id));
    } catch (error) {
      console.error('Error deleting stock reconciliation:', error);
      showNotification('Failed to delete stock reconciliation. Please try again later.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setReconToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReconToDelete(null);
  };

  const handleSort = (field: keyof StockRecon) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filterConfig = [
    {
      id: 'search',
      label: 'Search',
      type: 'text' as const
    },
    {
      id: 'date_range',
      label: 'Date Range',
      type: 'dateRange' as const
    }
  ];

  const filteredAndSortedRecons = useMemo(() => {
    return recons
      .filter(recon => {
        if (filters.search) {
          const searchTerm = String(filters.search).toLowerCase();
          return String(recon.product_id).toLowerCase().includes(searchTerm) ||
                 recon.adjustment_reason.toLowerCase().includes(searchTerm);
        }
        if (filters.date_range) {
          const dateRange = filters.date_range as { start: string; end: string };
          if (dateRange.start && dateRange.end) {
            const reconDate = new Date(recon.created_at).getTime();
            const startDate = new Date(dateRange.start).getTime();
            const endDate = new Date(dateRange.end).getTime();
            return reconDate >= startDate && reconDate <= endDate;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        const direction = sort.direction === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * direction;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * direction;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return (aValue.getTime() - bValue.getTime()) * direction;
        }
        return 0;
      });
  }, [recons, filters, sort]);

  useEffect(() => {
    const loadRecons = async () => {
      try {
        setLoading(true);
        const response = await getStockRecons();
        setRecons(response.data);
      } catch (error) {
        console.error('Error loading stock reconciliations:', error);
        showNotification('Failed to load stock reconciliations. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadRecons();
  }, [showNotification]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Stock Reconciliation List
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/transactions/stock-recon/new')}>
          New Stock Reconciliation
        </Button>
      </div>
      
      <ListFilters
        filters={filterConfig}
        values={filters}
        onChange={setFilters}
      />
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'product_id'}
                    direction={sort.field === 'product_id' ? sort.direction : 'asc'}
                    onClick={() => handleSort('product_id')}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sort.field === 'current_quantity'}
                    direction={sort.field === 'current_quantity' ? sort.direction : 'asc'}
                    onClick={() => handleSort('current_quantity')}
                  >
                    Current Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sort.field === 'actual_quantity'}
                    direction={sort.field === 'actual_quantity' ? sort.direction : 'asc'}
                    onClick={() => handleSort('actual_quantity')}
                  >
                    Actual Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sort.field === 'difference'}
                    direction={sort.field === 'difference' ? sort.direction : 'asc'}
                    onClick={() => handleSort('difference')}
                  >
                    Difference
                  </TableSortLabel>
                </TableCell>
                <TableCell>Adjustment Reason</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'created_at'}
                    direction={sort.field === 'created_at' ? sort.direction : 'asc'}
                    onClick={() => handleSort('created_at')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedRecons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No stock reconciliations found</TableCell>
                </TableRow>
              ) : (
                filteredAndSortedRecons.map((recon) => (
                  <TableRow key={recon.recon_id}>
                    <TableCell>{recon.product_id}</TableCell>
                    <TableCell align="right">{recon.current_quantity}</TableCell>
                    <TableCell align="right">{recon.actual_quantity}</TableCell>
                    <TableCell align="right">{recon.difference}</TableCell>
                    <TableCell>{recon.adjustment_reason}</TableCell>
                    <TableCell>{new Date(recon.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/transactions/stock-recon/${recon.recon_id}`)}
                          title="View"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/transactions/stock-recon/${recon.recon_id}/edit`)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(recon)}
                          color="error"
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Stock Reconciliation"
        message={`Are you sure you want to delete this stock reconciliation? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        severity="error"
      />
    </div>
  );
};

export default StockReconList;
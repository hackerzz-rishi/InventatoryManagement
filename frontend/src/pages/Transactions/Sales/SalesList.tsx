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
import { Sale } from '../../../types/transactions';
import { getSales, deleteSale } from '../../../api/transactions';
import { useNotification } from '../../../context/NotificationContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ListFilters from '../../../components/ListFilters';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: keyof Sale;
  direction: SortDirection;
}

interface FilterValue {
  [key: string]: string | number | { start: string; end: string } | null;
}

const SalesList: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [sort, setSort] = useState<SortConfig>({ field: 'invoice_date', direction: 'desc' });
  const [filters, setFilters] = useState<FilterValue>({
    search: null,
    date_range: null,
    customer_id: null
  });

  const handleDelete = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!saleToDelete) return;

    try {
      await deleteSale(saleToDelete.sales_id);
      showNotification('Sale deleted successfully', 'success');
      setSales(prev => prev.filter(s => s.sales_id !== saleToDelete.sales_id));
    } catch (error) {
      console.error('Error deleting sale:', error);
      showNotification('Failed to delete sale. Please try again later.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleSort = (field: keyof Sale) => {
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

  const filteredAndSortedSales = useMemo(() => {
    return sales
      .filter(sale => {
        if (filters.search) {
          const searchTerm = String(filters.search).toLowerCase();
          return sale.invoice_number.toLowerCase().includes(searchTerm) ||
                 String(sale.customer_id).includes(searchTerm);
        }
        if (filters.date_range) {
          const dateRange = filters.date_range as { start: string; end: string };
          if (dateRange.start && dateRange.end) {
            const saleDate = new Date(sale.invoice_date).getTime();
            const startDate = new Date(dateRange.start).getTime();
            const endDate = new Date(dateRange.end).getTime();
            return saleDate >= startDate && saleDate <= endDate;
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
  }, [sales, filters, sort]);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const response = await getSales();
        setSales(response.data);
      } catch (error) {
        console.error('Error loading sales:', error);
        showNotification('Failed to load sales. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [showNotification]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Sales List
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/transactions/sales/new')}>
          New Sale
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
                    active={sort.field === 'invoice_number'}
                    direction={sort.field === 'invoice_number' ? sort.direction : 'asc'}
                    onClick={() => handleSort('invoice_number')}
                  >
                    Invoice Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'invoice_date'}
                    direction={sort.field === 'invoice_date' ? sort.direction : 'asc'}
                    onClick={() => handleSort('invoice_date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sort.field === 'total_amount'}
                    direction={sort.field === 'total_amount' ? sort.direction : 'asc'}
                    onClick={() => handleSort('total_amount')}
                  >
                    Total Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">GST Amount</TableCell>
                <TableCell align="right">Net Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No sales found</TableCell>
                </TableRow>
              ) : (
                filteredAndSortedSales.map((sale) => (
                  <TableRow key={sale.sales_id}>
                    <TableCell>{sale.invoice_number}</TableCell>
                    <TableCell>{new Date(sale.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.customer_id}</TableCell>
                    <TableCell align="right">{sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell align="right">{sale.gst_amount.toFixed(2)}</TableCell>
                    <TableCell align="right">{sale.net_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/transactions/sales/${sale.sales_id}`)}
                          title="View"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/transactions/sales/${sale.sales_id}/edit`)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(sale)}
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
        title="Delete Sale"
        message={`Are you sure you want to delete sale ${saleToDelete?.invoice_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        severity="error"
      />
    </div>
  );
};

export default SalesList;
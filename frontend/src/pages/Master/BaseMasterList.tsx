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
import { Delete, Edit } from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ListFilters from '../../components/ListFilters';
import { apiClient } from '../../api/client';

interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

interface Props<T> {
  title: string;
  endpoint: string;
  columns: {
    field: keyof T;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'right' | 'center';
    render?: (value: any) => React.ReactNode;
  }[];
  addButtonLabel: string;
  onAdd: () => void;
  onEdit: (item: T) => void;
  idField: keyof T;
}

function BaseMasterList<T extends Record<string, any>>({
  title,
  endpoint,
  columns,
  addButtonLabel,
  onAdd,
  onEdit,
  idField
}: Props<T>) {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [sort, setSort] = useState<SortConfig<T>>({ field: columns[0].field, direction: 'asc' });
  const [filters, setFilters] = useState<{ [key: string]: string | number | { start: string; end: string } | null }>({
    search: null
  });

  const handleDelete = (item: T) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await apiClient.delete(`${endpoint}/${itemToDelete[idField]}`);
      showNotification('Item deleted successfully', 'success');
      setItems(prev => prev.filter(item => item[idField] !== itemToDelete[idField]));
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item. Please try again later.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSort = (field: keyof T) => {
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
    }
  ];

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => {
        if (filters.search) {
          const searchTerm = String(filters.search).toLowerCase();
          return Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm)
          );
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
        return 0;
      });
  }, [items, filters, sort]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endpoint);
        setItems(response.data.data);
      } catch (error) {
        console.error('Error loading items:', error);
        showNotification('Failed to load items. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [endpoint, showNotification]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Button variant="contained" color="primary" onClick={onAdd}>
          {addButtonLabel}
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
                {columns.map(column => (
                  <TableCell
                    key={String(column.field)}
                    align={column.align || 'left'}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={sort.field === column.field}
                        direction={sort.field === column.field ? sort.direction : 'asc'}
                        onClick={() => handleSort(column.field)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">No items found</TableCell>
                </TableRow>
              ) : (
                filteredAndSortedItems.map((item) => (
                  <TableRow key={String(item[idField])}>
                    {columns.map(column => (
                      <TableCell key={String(column.field)} align={column.align || 'left'}>
                        {column.render ? column.render(item[column.field]) : String(item[column.field])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item)}
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
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        severity="error"
      />
    </div>
  );
}

export default BaseMasterList;
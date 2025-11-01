import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
  Paper,
  Typography
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

export interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: FilterOption[];
}

interface FilterValue {
  [key: string]: string | number | { start: string; end: string } | null;
}

interface ListFiltersProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
}

const ListFilters: React.FC<ListFiltersProps> = ({
  filters,
  values,
  onChange
}) => {
  const [open, setOpen] = React.useState(false);

  const handleChange = (id: string, value: any) => {
    onChange({ ...values, [id]: value });
  };

  const handleClear = () => {
    const clearedValues = filters.reduce((acc, filter) => {
      acc[filter.id] = null;
      return acc;
    }, {} as FilterValue);
    onChange(clearedValues);
  };

  const renderFilterInput = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <TextField
            select
            fullWidth
            size="small"
            value={values[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {filter.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'date':
        return (
          <TextField
            type="date"
            fullWidth
            size="small"
            value={values[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'dateRange':
        const dateRange = (values[filter.id] as { start: string; end: string }) || { start: '', end: '' };
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              type="date"
              size="small"
              label="From"
              value={dateRange.start}
              onChange={(e) => handleChange(filter.id, { ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={dateRange.end}
              onChange={(e) => handleChange(filter.id, { ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={values[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
            placeholder={`Search by ${filter.label.toLowerCase()}`}
          />
        );
    }
  };

  const hasActiveFilters = Object.values(values).some((value) => value !== null && value !== '');

  return (
    <Box mb={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => setOpen(!open)} color={hasActiveFilters ? 'primary' : 'default'}>
          <FilterListIcon />
        </IconButton>
        <Typography variant="subtitle2">
          {hasActiveFilters ? 'Filters active' : 'Filter'}
        </Typography>
        {hasActiveFilters && (
          <IconButton size="small" onClick={handleClear} title="Clear filters">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Collapse in={open}>
        <Paper sx={{ mt: 1, p: 2 }}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={2}>
            {filters.map((filter) => (
              <Box key={filter.id}>
                <Typography variant="caption" display="block" gutterBottom>
                  {filter.label}
                </Typography>
                {renderFilterInput(filter)}
              </Box>
            ))}
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ListFilters;
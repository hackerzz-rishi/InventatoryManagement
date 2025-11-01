import React from 'react';
import { Alert as MuiAlert, Snackbar } from '@mui/material';

interface AlertProps {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        severity={severity}
        onClose={onClose}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
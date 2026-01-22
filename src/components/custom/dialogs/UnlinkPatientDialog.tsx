'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';
import { Warning, LinkOff, Close } from '@mui/icons-material';

interface UnlinkPatientDialogProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  onUnlinked: () => void;
}

const UnlinkPatientDialog = ({ 
  open, 
  onClose, 
  patientName, 
  patientId,
  onUnlinked 
}: UnlinkPatientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlink = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Unlinking patient with ID:', patientId);
      
      // Call unlink API
      const { unlinkPatient } = await import('@/requests/doctor/doctor.requests');
      const response = await unlinkPatient(patientId);

      console.log('Unlink response:', response);

      if (!response.error) {
        onUnlinked();
        onClose();
      } else {
        setError(response.message || 'Failed to unlink patient');
      }
    } catch (err: any) {
      console.error('Unlink error:', err);
      setError(err.message || 'An error occurred while unlinking patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          <Typography variant="h6" fontWeight="bold">
            Unlink Patient
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Warning: This action will remove the patient from your care.
          </Typography>
        </Alert>

        <Typography variant="body1" gutterBottom>
          Are you sure you want to unlink <strong>{patientName}</strong>?
        </Typography>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            • The patient will no longer appear in your patient list
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • You will lose access to their medical records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • This relationship can be restored later if needed
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUnlink}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <LinkOff />}
        >
          {loading ? 'Unlinking...' : 'Unlink Patient'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnlinkPatientDialog;

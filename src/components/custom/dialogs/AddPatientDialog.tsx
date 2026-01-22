'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { useState } from 'react';
import { Person, Email as EmailIcon, Badge } from '@mui/icons-material';
import { linkPatient } from '@/requests/doctor/doctor.requests';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddPatientDialog = ({ open, onClose, onPatientAdded }: AddPatientDialogProps) => {
  const [searchMethod, setSearchMethod] = useState(0); // 0 = Email, 1 = IDNP
  const [email, setEmail] = useState('');
  const [idnp, setIdnp] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => {
    setEmail('');
    setIdnp('');
    setNotes('');
    setError('');
    setSuccess('');
    setSearchMethod(0);
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (searchMethod === 0 && !email.trim()) {
      setError('Please enter a patient email');
      return;
    }

    if (searchMethod === 1 && !idnp.trim()) {
      setError('Please enter a patient IDNP');
      return;
    }

    setLoading(true);

    try {
      // Build payload with only the relevant fields (no undefined values)
      const payload: any = {};
      
      if (searchMethod === 0) {
        payload.email = email.trim();
      } else {
        payload.idnp = idnp.trim();
      }
      
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const response = await linkPatient(payload);

      if (!response.error) {
        setSuccess('Patient successfully linked!');
        setTimeout(() => {
          onPatientAdded();
          handleClose();
        }, 1500);
      } else {
        setError(response.message || 'Failed to link patient');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while linking patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Person color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Add Patient
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Search Method Tabs */}
          <Tabs
            value={searchMethod}
            onChange={(_, value) => {
              setSearchMethod(value);
              setError('');
              setSuccess('');
            }}
            sx={{ mb: 3 }}
          >
            <Tab label="Search by Email" icon={<EmailIcon />} iconPosition="start" />
            <Tab label="Search by IDNP" icon={<Badge />} iconPosition="start" />
          </Tabs>

          {/* Email Search */}
          {searchMethod === 0 && (
            <TextField
              label="Patient Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />
          )}

          {/* IDNP Search */}
          {searchMethod === 1 && (
            <TextField
              label="Patient IDNP"
              fullWidth
              value={idnp}
              onChange={(e) => setIdnp(e.target.value)}
              placeholder="Enter patient IDNP"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />
          )}

          {/* Notes */}
          <TextField
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this patient..."
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Info Message */}
          <Alert severity="info" icon={<Person />}>
            <Typography variant="body2">
              Search for an existing patient by their email or IDNP to link them to your care.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Person />}
        >
          {loading ? 'Linking...' : 'Link Patient'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPatientDialog;

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import PatientProfileCard from '@/views/dashboard/admin/tabs/PatientProfile';
import axios from 'axios';

// Interfaces and Hooks 

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  duration: number;
  status: number;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface Vaccine {
  id: string;
  patientId: string;
  vaccineName: string;
  dateAdministered: string;
  administeredById?: string;
  doctorName?: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergenName: string;
  severity: string;
  reaction?: string;
  recordedById?: string;
  notes?: string;
  createdAt: string;
}

export const usePatientVaccines = (patientId: string) => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [vaccinesError, setVaccinesError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchVaccines = async () => {
      setVaccinesLoading(true);
      setVaccinesError(null);
      try {
        const token =
          getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const res = await axios.get<{ data: Vaccine[] }>(
          `http://localhost:5152/api/Patient/${patientId}/vaccinations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVaccines(res.data.data || []);
      } catch (err: any) {
        setVaccinesError(err.message || 'Error fetching vaccines');
      } finally {
        setVaccinesLoading(false);
      }
    };

    fetchVaccines();
  }, [patientId]);

  return { vaccines, vaccinesLoading, vaccinesError };
};

export const usePatientAllergies = (patientId: string) => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [allergiesLoading, setAllergiesLoading] = useState(false);
  const [allergiesError, setAllergiesError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchAllergies = async () => {
      setAllergiesLoading(true);
      setAllergiesError(null);
      try {
        const token =
          getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const res = await axios.get<{ data: Allergy[] }>(
          `http://localhost:5152/api/Patient/${patientId}/allergies`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllergies(res.data.data || []);
      } catch (err: any) {
        setAllergiesError(err.message || 'Error fetching allergies');
      } finally {
        setAllergiesLoading(false);
      }
    };

    fetchAllergies();
  }, [patientId]);

  return { allergies, allergiesLoading, allergiesError };
};

export const usePatientAppointments = (patientId: string) => {
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchAppointments = async () => {
      setPatientLoading(true);
      setPatientError(null);
      try {
        const token =
          getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        // This endpoint returns appointments for a specific patient
        const res = await axios.get<{ data: Appointment[] }>(
          `http://localhost:5152/api/Patient/${patientId}/appointments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPatientAppointments(res.data.data || []);
      } catch (err: any) {
        setPatientError(err.message || "Error fetching appointments");
      } finally {
        setPatientLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  return { patientAppointments, patientLoading, patientError };
};

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: 'Active' | 'Inactive';
  address: string;
  dateOfBirth: string;
  recentVaccinations?: Vaccine[];
  activeAllergies?: Allergy[];
  idnp: string;
  gender: number;
  bloodType: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: Allergy[];
}

export default function ClientListView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientPage, setPatientPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');

  // viewing patient
  const [openPatientProfile, setOpenPatientProfile] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { patientAppointments, patientLoading, patientError } = usePatientAppointments(selectedPatient?.id || '');
  const { vaccines, vaccinesLoading, vaccinesError } = usePatientVaccines(selectedPatient?.id || '');
  const { allergies, allergiesLoading, allergiesError } = usePatientAllergies(selectedPatient?.id || '');

  // adding new patient
  const [openAddPatient, setOpenAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    IDNP: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodType: ''
  });

  // editing existing patient
  const [openEditPatient, setOpenEditPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Partial<Patient & { dateOfBirth?: string }> | null>(null);

  const fetchPatients = async (page = patientPage) => {
    setLoadingPatients(true);
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const res = await axiosInstance.get('/Admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, pageSize, role: 'Patient' },
      });

      const usersData = res.data.data || [];
      setPatients(usersData.map((item: any) => ({
        id: item.user.id,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        phoneNumber: item.user.phoneNumber,
        status: item.user.isActive ? 'Active' : 'Inactive',
        address: item.user.address,
        dateOfBirth: item.user.dateOfBirth,
        gender: item.user.gender,
        bloodType: item.user.bloodType,
        allergies: item.user.allergies,
        insuranceProvider: item.user.insuranceProvider,
        insurancePolicyNumber: item.user.insurancePolicyNumber,
        emergencyContactName: item.user.emergencyContactName,
        emergencyContactPhone: item.user.emergencyContactPhone,
        idnp: item.user.idnp,
      })));
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleOpenAddPatient = () => setOpenAddPatient(true);
  const handleCloseAddPatient = () => setOpenAddPatient(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: name === 'gender' ? Number(value) : value
    }));
  };

  const handleAddPatient = async () => {
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const payload = {
        ...newPatient,
        dateOfBirth: new Date(newPatient.dateOfBirth).toISOString(),
      };

      await axiosInstance.post('/Admin/createPatient', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      handleCloseAddPatient();
      fetchPatients();
    } catch (err: any) {
      console.error('Failed to add patient:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to add patient');
    }
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setEditingPatient({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      email: patient.email,
      address: patient.address,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      bloodType: patient.bloodType,
    });
    setOpenEditPatient(true);
  };

  const handleCloseEditPatient = () => {
    setOpenEditPatient(false);
    setEditingPatient(null);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!editingPatient) return;
    setEditingPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient || !editingPatient.id) return;

    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const originalPatient = patients.find(p => p.id === editingPatient.id);
      if (!originalPatient) throw new Error('Original patient not found');

      const payload: any = {};

      if (editingPatient.firstName && editingPatient.firstName !== originalPatient.firstName)
        payload.firstName = editingPatient.firstName;

      if (editingPatient.lastName && editingPatient.lastName !== originalPatient.lastName)
        payload.lastName = editingPatient.lastName;

      if (editingPatient.phoneNumber && editingPatient.phoneNumber !== originalPatient.phoneNumber)
        payload.phoneNumber = editingPatient.phoneNumber;

      if (editingPatient.address && editingPatient.address !== originalPatient.address)
        payload.address = editingPatient.address;
        
      if (editingPatient.email && editingPatient.email !== originalPatient.email)
        payload.email = editingPatient.email;

      if (editingPatient.insuranceProvider !== undefined && editingPatient.insuranceProvider !== originalPatient.insuranceProvider)
        payload.insuranceProvider = editingPatient.insuranceProvider;

      if (editingPatient.insurancePolicyNumber !== undefined && editingPatient.insurancePolicyNumber !== originalPatient.insurancePolicyNumber)
        payload.insurancePolicyNumber = editingPatient.insurancePolicyNumber;

      if (editingPatient.emergencyContactName !== undefined && editingPatient.emergencyContactName !== originalPatient.emergencyContactName)
        payload.emergencyContactName = editingPatient.emergencyContactName;

      if (editingPatient.emergencyContactPhone !== undefined && editingPatient.emergencyContactPhone !== originalPatient.emergencyContactPhone)
        payload.emergencyContactPhone = editingPatient.emergencyContactPhone;

      if (editingPatient.bloodType !== undefined && editingPatient.bloodType !== originalPatient.bloodType)
        payload.bloodType = editingPatient.bloodType;

      if (Object.keys(payload).length === 0) {
        alert('No changes to update.');
        return;
      }

      await axiosInstance.put(`/Admin/updatePatient/${editingPatient.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Patient updated successfully');
      handleCloseEditPatient();
      fetchPatients();
    } catch (err: any) {
      console.error('Failed to update patient:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to update patient');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axiosInstance.delete(`/Admin/deletePatient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Patient deleted successfully');
      handleCloseEditPatient();
      fetchPatients();
    } catch (err: any) {
      console.error('Failed to delete patient:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to delete patient');
    }
  };

  const toggleUserStatus = async (userId: string, role: 'Doctor' | 'Patient', isActive: boolean) => {
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axiosInstance.post(
        `/Admin/toggle-status/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchPatients(patientPage);
    } catch (err) {
      console.error(`Error updating ${role} status:`, err);
      alert('Failed to update status');
    }
  };

  const handleViewProfile = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenPatientProfile(true);
  };

  useEffect(() => {
    fetchPatients();
  }, [patientPage]);

  const filteredPatients = patients.filter(pt =>
    `${pt.firstName} ${pt.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pt.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Patient Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenAddPatient}
            sx={{
              backgroundColor: '#2563EB',
              '&:hover': { backgroundColor: '#1E40AF' },
            }}
          >
            + Add New Patient
          </Button>
        </Box>

        <Box mb={2}>
          <TextField
            variant="outlined"
            placeholder="Search patients by name or email..."
            fullWidth
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {loadingPatients ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : patients.length === 0 ? (
          <Typography>No patients found.</Typography>
        ) : (
          <>
            <Table
              sx={{
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& th': {
                  backgroundColor: 'background.primary',
                  fontWeight: 'bold',
                  color: 'primary',
                },
                '& td': {
                  py: 0.5,
                },
                '& td, & th': {
                  borderBottom: '',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Blood Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((pt) => (
                  <TableRow key={pt.id}>
                    <TableCell>{`${pt.firstName} ${pt.lastName}`}</TableCell>
                    <TableCell>{pt.email}</TableCell>
                    <TableCell>{pt.phoneNumber}</TableCell>
                    <TableCell>{pt.bloodType || 'N/A'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: '9999px',
                          backgroundColor: pt.status === 'Active' ? '#2563EB' : '#E5E7EB',
                          color: pt.status === 'Active' ? '#FFFFFF' : '#6B7280',
                          fontSize: 12,
                          fontWeight: 500,
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                      >
                        {pt.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewProfile(pt)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            '&:hover': { borderColor: '#1E40AF', backgroundColor: '#EFF6FF' }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenEditPatient(pt)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#10B981',
                            color: '#10B981',
                            '&:hover': { borderColor: '#059669', backgroundColor: '#ECFDF5' }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleUserStatus(pt.id, 'Patient', pt.status === 'Active')}
                          sx={{
                            textTransform: 'none',
                            borderColor: pt.status === 'Active' ? '#F59E0B' : '#10B981',
                            color: pt.status === 'Active' ? '#F59E0B' : '#10B981',
                            '&:hover': {
                              borderColor: pt.status === 'Active' ? '#D97706' : '#059669',
                              backgroundColor: pt.status === 'Active' ? '#FEF3C7' : '#ECFDF5'
                            }
                          }}
                        >
                          {pt.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDeletePatient(pt.id)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            '&:hover': { borderColor: '#DC2626', backgroundColor: '#FEE2E2' }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box mt={2}>
              <Button
                  disabled={patientPage === 1}
                  onClick={() => {
                  setPatientPage(patientPage - 1);
                  fetchPatients(patientPage - 1);
                  }}
              >
                  Previous
              </Button>
              <Button
                  disabled={patients.length < pageSize}
                  onClick={() => {
                  setPatientPage(patientPage + 1);
                  fetchPatients(patientPage + 1);
                  }}
              >
                  Next
              </Button>
            </Box>
          </>
        )}

        {/* Dialogs */}
        <Dialog
            open={openAddPatient}
            onClose={handleCloseAddPatient}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: '#FAFAFA' } }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>Add New Patient</DialogTitle>
            <DialogContent>
            <Grid container spacing={2} mt={1}>
                {/* Form Fields */}
                <Grid item xs={12} sm={6}>
                <TextField label="First Name" name="firstName" fullWidth value={newPatient.firstName} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Last Name" name="lastName" fullWidth value={newPatient.lastName} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField select label="Gender" name="gender" fullWidth margin="dense" value={Number(newPatient.gender)} onChange={handleInputChange} SelectProps={{ native: true }}>
                    <option value="">Select gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Email" name="email" fullWidth value={newPatient.email} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phoneNumber" fullWidth value={newPatient.phoneNumber} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Date of Birth" name="dateOfBirth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newPatient.dateOfBirth} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12}>
                <TextField label="Address" name="address" fullWidth value={newPatient.address} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="IDNP" name="IDNP" fullWidth value={newPatient.IDNP} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Blood Type" name="bloodType" fullWidth value={newPatient.bloodType} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Insurance Provider" name="insuranceProvider" fullWidth value={newPatient.insuranceProvider} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Insurance Policy Number" name="insurancePolicyNumber" fullWidth value={newPatient.insurancePolicyNumber} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Emergency Contact Name" name="emergencyContactName" fullWidth value={newPatient.emergencyContactName} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Emergency Contact Phone" name="emergencyContactPhone" fullWidth value={newPatient.emergencyContactPhone} onChange={handleInputChange} />
                </Grid>
            </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={handleCloseAddPatient} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#E5E7EB', color: '#374151', fontWeight: 600, '&:hover': { backgroundColor: '#D1D5DB' } }}>
                Cancel
            </Button>
            <Button variant="contained" onClick={handleAddPatient} sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1E40AF' }, borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}>
                Add Patient
            </Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={openEditPatient}
            onClose={handleCloseEditPatient}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: '#FAFAFA' } }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>Edit Patient</DialogTitle>
            <DialogContent>
            <Grid container spacing={2} mt={1}>
                {/* Edit Form */}
                <Grid item xs={12} sm={6}>
                <TextField label="First Name" name="firstName" fullWidth value={editingPatient?.firstName || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Last Name" name="lastName" fullWidth value={editingPatient?.lastName || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phoneNumber" fullWidth value={editingPatient?.phoneNumber || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Email" name="email" fullWidth value={editingPatient?.email || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12}>
                <TextField label="Address" name="address" fullWidth value={editingPatient?.address || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Blood Type" name="bloodType" fullWidth value={editingPatient?.bloodType || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Insurance Provider" name="insuranceProvider" fullWidth value={editingPatient?.insuranceProvider || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Policy Number" name="insurancePolicyNumber" fullWidth value={editingPatient?.insurancePolicyNumber || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Emerg. Contact" name="emergencyContactName" fullWidth value={editingPatient?.emergencyContactName || ''} onChange={handleEditInputChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField label="Emerg. Phone" name="emergencyContactPhone" fullWidth value={editingPatient?.emergencyContactPhone || ''} onChange={handleEditInputChange} />
                </Grid>
            </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={() => editingPatient?.id && handleDeletePatient(editingPatient.id)} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 600, '&:hover': { backgroundColor: '#B91C1C' } }}>
                Delete Patient
            </Button>
            <Button onClick={handleCloseEditPatient} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#E5E7EB', color: '#374151', fontWeight: 600, '&:hover': { backgroundColor: '#D1D5DB' } }}>
                Cancel
            </Button>
            <Button variant="contained" onClick={handleUpdatePatient} sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1E40AF' }, borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}>
                Update Patient
            </Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={openPatientProfile}
            onClose={() => setOpenPatientProfile(false)}
            maxWidth="lg"
            fullWidth
        >
            <DialogContent>
            {selectedPatient && (
                <PatientProfileCard
                patient={{
                    id: selectedPatient.id,
                    idnp: selectedPatient.idnp,
                    firstName: selectedPatient.firstName,
                    lastName: selectedPatient.lastName,
                    email: selectedPatient.email,
                    phoneNumber: selectedPatient.phoneNumber,
                    status: selectedPatient.status,
                    dateOfBirth: selectedPatient.dateOfBirth || 'N/A',
                    recentVaccinations: selectedPatient.recentVaccinations || [],
                    activeAllergies: selectedPatient.activeAllergies || [],
                    address: selectedPatient.address || 'N/A',
                    gender: selectedPatient.gender || 0,
                    bloodType: selectedPatient.bloodType || 'N/A',
                }}
                patientAppointments={patientAppointments}
                patientAppointmentsLoading={patientLoading}
                patientAppointmentsError={patientError}
                vaccines={vaccines}
                vaccinesLoading={vaccinesLoading}
                vaccinesError={vaccinesError}
                allergies={allergies}
                allergiesLoading={allergiesLoading}
                allergiesError={allergiesError}
                />
            )}
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

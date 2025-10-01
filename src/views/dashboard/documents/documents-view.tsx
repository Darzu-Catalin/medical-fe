'use client'

import { useState, useEffect } from 'react'
import { enqueueSnackbar } from 'notistack'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  MenuItem
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  uploadDocumentRequest,
  getPatientDocumentsRequest,
  deleteDocumentRequest,
  DocumentData 
} from '@/requests/documents/documents.requests'

export default function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadDialog, setUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('MedicalCertificate')
  
  const { user, userRole } = useAppSelector((state) => state.auth)

  const documentTypes = [
    { value: 'MedicalCertificate', label: 'Medical Certificate' },
    { value: 'LabResults', label: 'Lab Results' },
    { value: 'XRay', label: 'X-Ray' },
    { value: 'MRI', label: 'MRI' },
    { value: 'Prescription', label: 'Prescription' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Other', label: 'Other' }
  ]

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      let response
      if (userRole === 'patient' && user?.id) {
        // Patient sees their own documents
        response = await getPatientDocumentsRequest(user.id.toString())
      } else if (userRole === 'doctor') {
        // For now, doctors see all documents - this would need patient selection in real app
        response = { success: true, data: [] }
      } else {
        response = { success: true, data: [] }
      }

      if (response.error) {
        setError(response.message || 'Failed to load documents')
      } else {
        setDocuments(response.data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load documents')
      enqueueSnackbar('Failed to load documents', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [user, userRole])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        enqueueSnackbar('File size must be less than 10MB', { variant: 'error' })
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar('File type not supported. Please use PDF, JPG, PNG, DOC, or DOCX', { variant: 'error' })
        return
      }
      
      setSelectedFile(file)
      setDocumentType('MedicalCertificate')
      setUploadDialog(true)
    }
  }

  const handleCloseDialog = () => {
    setUploadDialog(false)
    setSelectedFile(null)
    setDocumentType('MedicalCertificate')
  }

  const handleUpload = async () => {
    if (!selectedFile || !user?.id || !documentType) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('patientId', user.id.toString())
      formData.append('documentType', documentType)

      const response = await uploadDocumentRequest(formData)
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to upload document', { variant: 'error' })
      } else {
        enqueueSnackbar('Document uploaded successfully', { variant: 'success' })
        handleCloseDialog()
        fetchDocuments()
      }
    } catch (err) {
      enqueueSnackbar('Failed to upload document', { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await deleteDocumentRequest(documentId)
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to delete document', { variant: 'error' })
      } else {
        enqueueSnackbar('Document deleted successfully', { variant: 'success' })
        fetchDocuments()
      }
    } catch (err) {
      enqueueSnackbar('Failed to delete document', { variant: 'error' })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return 'mdi:file-pdf'
    if (contentType.includes('image')) return 'mdi:file-image'
    if (contentType.includes('word')) return 'mdi:file-word'
    return 'mdi:file-document'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          {userRole === 'patient' ? 'My Documents' : 'Documents'}
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:refresh" />}
            onClick={fetchDocuments}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:upload" />}
            component="label"
          >
            Upload Document
            <input
              type="file"
              hidden
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {documents.length === 0 && !error ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="mdi:file-document-outline" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No documents uploaded yet
              </Typography>
              <Typography color="text.secondary">
                Upload your first medical document to get started
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon={getFileTypeIcon(doc.contentType)} sx={{ fontSize: 24 }} />
                      <Typography>{doc.originalName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.contentType.split('/')[1].toUpperCase()} size="small" />
                  </TableCell>
                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(doc.id)}
                      size="small"
                    >
                      <Iconify icon="mdi:delete" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              select
              fullWidth
              required
            >
              {documentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            {selectedFile && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selected file:
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Iconify icon={getFileTypeIcon(selectedFile.type)} sx={{ fontSize: 24 }} />
                  <Box>
                    <Typography>{selectedFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile || !documentType}
          >
            Upload
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
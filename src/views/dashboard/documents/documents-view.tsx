'use client'

import { useState, useEffect, useMemo } from 'react'
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
  MenuItem,
  InputAdornment,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  uploadDocumentRequest,
  getPatientDocumentsRequest,
  deleteDocumentRequest,
  downloadDocumentRequest,
  viewDocumentRequest,
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
  const [viewDialog, setViewDialog] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<DocumentData | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const { user, userRole } = useAppSelector((state) => state.auth)

  // Document type labels for user-friendly display
  const documentTypeLabels: Record<string, string> = {
    MedicalCertificate: 'Medical Certificate',
    Prescription: 'Prescription',
    LabResult: 'Lab Result',
    MedicalReport: 'Medical Report',
    InsuranceDocument: 'Insurance Document',
    ConsentForm: 'Consent Form',
    DischargeSummary: 'Discharge Summary',
    Referral: 'Referral Letter',
    MedicalHistory: 'Medical History',
    Other: 'Other Document'
  }

  const documentTypes = [
    { value: 'MedicalCertificate', label: 'Medical Certificate' },
    { value: 'Prescription', label: 'Prescription' },
    { value: 'LabResult', label: 'Lab Result' },
    { value: 'MedicalReport', label: 'Medical Report' },
    { value: 'InsuranceDocument', label: 'Insurance Document' },
    { value: 'ConsentForm', label: 'Consent Form' },
    { value: 'DischargeSummary', label: 'Discharge Summary' },
    { value: 'Referral', label: 'Referral Letter' },
    { value: 'MedicalHistory', label: 'Medical History' },
    { value: 'Other', label: 'Other Document' }
  ]

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter((doc) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        doc.fileName.toLowerCase().includes(searchLower) ||
        (documentTypeLabels[doc.documentType] || doc.documentType).toLowerCase().includes(searchLower)
      
      // Type filter
      const matchesType = filterType === 'all' || doc.documentType === filterType
      
      return matchesSearch && matchesType
    })

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName)
          break
        case 'type':
          const typeA = documentTypeLabels[a.documentType] || a.documentType
          const typeB = documentTypeLabels[b.documentType] || b.documentType
          comparison = typeA.localeCompare(typeB)
          break
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [documents, searchQuery, filterType, sortBy, sortOrder, documentTypeLabels])

  const handleSort = (column: 'name' | 'type' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

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

  const handleViewDocument = async (doc: DocumentData) => {
    setViewingDocument(doc)
    setViewDialog(true)
    
    // For images, we can create a blob URL. For other files, we might need a different approach
    if (doc.mimeType.includes('image')) {
      try {
        const blob = await downloadDocumentRequest(doc.id)
        if (blob) {
          const url = URL.createObjectURL(blob)
          setDocumentUrl(url)
        }
      } catch (err) {
        enqueueSnackbar('Failed to load document preview', { variant: 'error' })
      }
    } else {
      // For PDFs and other documents, try to get a view URL from the API
      try {
        const url = await viewDocumentRequest(doc.id)
        setDocumentUrl(url)
      } catch (err) {
        enqueueSnackbar('Preview not available for this file type', { variant: 'warning' })
      }
    }
  }

  const handleDownloadDocument = async (doc: DocumentData) => {
    setDownloading(doc.id)
    
    try {
      const blob = await downloadDocumentRequest(doc.id)
      
      console.log('Download response:', blob) // Debug log
      
      if (blob && blob instanceof Blob && blob.size > 0) {
        // Create download link
        const url = URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = doc.fileName
        a.style.display = 'none' // Hide the element
        window.document.body.appendChild(a)
        a.click()
        
        // Cleanup
        setTimeout(() => {
          window.document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
        
        enqueueSnackbar('Document downloaded successfully', { variant: 'success' })
      } else {
        console.error('Invalid blob received:', blob)
        enqueueSnackbar('Failed to download document - Invalid file data', { variant: 'error' })
      }
    } catch (err: any) {
      console.error('Download error:', err)
      enqueueSnackbar(`Failed to download document: ${err.message || 'Unknown error'}`, { variant: 'error' })
    } finally {
      setDownloading(null)
    }
  }

  const handleCloseViewDialog = () => {
    setViewDialog(false)
    setViewingDocument(null)
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl)
      setDocumentUrl(null)
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
    if (!contentType) return 'mdi:file-document'
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

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 240 }}
          />
          
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              input={<OutlinedInput label="Document Type" />}
            >
              <MenuItem value="all">All Types</MenuItem>
              {documentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {filteredAndSortedDocuments.length} of {documents.length} documents
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredAndSortedDocuments.length === 0 && documents.length === 0 && !error ? (
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
      ) : filteredAndSortedDocuments.length === 0 && documents.length > 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="eva:search-fill" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No documents found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                      sx={{ fontWeight: 'fontWeightSemiBold' }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>File Type</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'type'}
                      direction={sortBy === 'type' ? sortOrder : 'asc'}
                      onClick={() => handleSort('type')}
                      sx={{ fontWeight: 'fontWeightSemiBold' }}
                    >
                      Document Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'date'}
                      direction={sortBy === 'date' ? sortOrder : 'asc'}
                      onClick={() => handleSort('date')}
                      sx={{ fontWeight: 'fontWeightSemiBold' }}
                    >
                      Upload Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon={getFileTypeIcon(doc.mimeType)} sx={{ fontSize: 24 }} />
                      <Typography>{doc.fileName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={doc.mimeType ? doc.mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN' : 'UNKNOWN'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={documentTypeLabels[doc.documentType] || doc.documentType} 
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDocument(doc)}
                        size="small"
                        title="View Document"
                      >
                        <Iconify icon="mdi:eye" />
                      </IconButton>
                      
                      <IconButton
                        color="info"
                        onClick={() => handleDownloadDocument(doc)}
                        size="small"
                        disabled={downloading === doc.id}
                        title="Download Document"
                      >
                        {downloading === doc.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Iconify icon="mdi:download" />
                        )}
                      </IconButton>
                      
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doc.id)}
                        size="small"
                        title="Delete Document"
                      >
                        <Iconify icon="mdi:delete" />
                      </IconButton>
                    </Stack>
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

      {/* Document Viewer Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">
                {viewingDocument?.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {viewingDocument ? formatFileSize(viewingDocument.fileSizeBytes) : ''}
              </Typography>
            </Box>
            <IconButton
              onClick={() => viewingDocument && handleDownloadDocument(viewingDocument)}
              disabled={downloading === viewingDocument?.id}
            >
              {downloading === viewingDocument?.id ? (
                <CircularProgress size={24} />
              ) : (
                <Iconify icon="mdi:download" />
              )}
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {viewingDocument && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewingDocument.mimeType.includes('image') && documentUrl ? (
                <Box
                  component="img"
                  src={documentUrl}
                  alt={viewingDocument.fileName}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : viewingDocument.mimeType.includes('pdf') && documentUrl ? (
                <Box
                  component="iframe"
                  src={documentUrl}
                  title={viewingDocument.fileName}
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <Box textAlign="center" py={4}>
                  <Iconify 
                    icon={getFileTypeIcon(viewingDocument.mimeType)} 
                    sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} 
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Preview not available
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    File type: {viewingDocument.mimeType}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="mdi:download" />}
                    onClick={() => handleDownloadDocument(viewingDocument)}
                    disabled={downloading === viewingDocument.id}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
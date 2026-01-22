'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { enqueueSnackbar } from 'notistack'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Drawer,
  Badge,
  alpha
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { getNotificationsRequest, NotificationData } from '@/requests/notifications/notifications.requests'
import { RootState } from 'src/redux/store'

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showAll, setShowAll] = useState(true) // Show all notifications by default
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  
  // Get current user from Redux
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const userEmail = currentUser?.email?.toLowerCase()
  
  // Utility function to strip HTML tags from text
  const stripHtml = (html: string): string => {
    if (!html) return ''
    
    // Check if it's HTML content
    const isHtml = /<[^>]*>/g.test(html)
    if (!isHtml) {
      // Not HTML, just clean up whitespace
      return html.replace(/\r\n|\n|\r/g, ' ').replace(/\s+/g, ' ').trim()
    }
    
    // Remove DOCTYPE, head, style, script tags and their content
    let cleaned = html
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    
    // Parse HTML to extract text content from body only
    const parser = new DOMParser()
    const doc = parser.parseFromString(cleaned, 'text/html')
    
    // Try to get body content, fallback to full document
    const body = doc.body || doc.documentElement
    const textContent = body.textContent || body.innerText || ''
    
    // Clean up extra whitespace, newlines, and special characters
    return textContent
      .replace(/\r\n|\n|\r/g, ' ')  // Replace line breaks with space
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\{\{[^}]+\}\}/g, '')  // Remove template variables like {{Duration}}
      .trim()
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await getNotificationsRequest()
      console.log('=== NOTIFICATIONS DEBUG ===')
      console.log('Raw API Response:', response)
      console.log('Response type:', typeof response)
      console.log('Is Array?:', Array.isArray(response))
      console.log('Current User Email:', userEmail)
      
      if (response.error) {
        setError(response.message || 'Failed to load notifications')
        console.error('Error from API:', response)
      } else {
        // Handle both direct array and wrapped response
        let data: NotificationData[] = []
        
        if (Array.isArray(response)) {
          // Direct array response
          data = response
          console.log('✓ Direct array response')
        } else if (response.data && Array.isArray(response.data)) {
          // Wrapped in data property
          data = response.data
          console.log('✓ Wrapped in data property')
        } else if (Array.isArray(response.data)) {
          data = response.data
          console.log('✓ Found array in response.data')
        } else {
          console.warn('⚠️ Unexpected response format:', response)
          data = []
        }
        
        console.log('Final notifications array:', data)
        console.log('Total notifications:', data.length)
        setNotifications(data)
        setError(null)
      }
    } catch (err) {
      console.error('Exception fetching notifications:', err)
      setError('Failed to load notifications')
      enqueueSnackbar('Failed to load notifications', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])
  
  // Filter notifications for current user's email (or show all if toggle is on)
  const userNotifications = useMemo(() => {
    console.log('=== FILTERING NOTIFICATIONS ===')
    console.log('showAll:', showAll)
    console.log('Total notifications:', notifications.length)
    console.log('User email:', userEmail)
    
    let filtered: NotificationData[] = []
    
    if (showAll) {
      console.log('✓ Showing all notifications:', notifications.length)
      filtered = [...notifications]
    } else {
      if (!userEmail) {
        console.log('⚠️ No user email found')
        return []
      }
      
      filtered = notifications.filter((notification) => {
        const match = notification.toEmail?.toLowerCase() === userEmail
        if (!match) {
          console.log(`✗ Skipping notification #${notification.id} (toEmail: ${notification.toEmail})`)
        }
        return match
      })
      
      console.log(`✓ Filtered notifications for ${userEmail}:`, filtered.length)
    }
    
    // Sort by date
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
    
    console.log('Sorted data:', sorted)
    return sorted
  }, [notifications, userEmail, showAll, sortOrder])
  
  const handleOpenNotification = (notification: NotificationData) => {
    setSelectedNotification(notification)
    setDrawerOpen(true)
  }
  
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
  }

  const getTypeIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || ''
    if (lowerType.includes('appointment')) return 'mdi:calendar-clock'
    if (lowerType.includes('visit') || lowerType.includes('record')) return 'mdi:file-document'
    if (lowerType.includes('registration') || lowerType.includes('welcome')) return 'mdi:account-plus'
    return 'mdi:bell'
  }

  const getTypeColor = (type: string) => {
    const lowerType = type?.toLowerCase() || ''
    if (lowerType.includes('appointment')) return 'primary'
    if (lowerType.includes('visit') || lowerType.includes('record')) return 'info'
    if (lowerType.includes('registration') || lowerType.includes('welcome')) return 'success'
    return 'default'
  }
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4">Notifications</Typography>
          <Chip 
            label={`${userNotifications.length} ${showAll ? 'Total' : 'Mine'}`} 
            color="primary" 
            size="small"
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant={showAll ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowAll(!showAll)}
            startIcon={<Iconify icon={showAll ? "mdi:email-multiple" : "mdi:email"} />}
          >
            {showAll ? 'All' : 'My Notifications'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            startIcon={<Iconify icon={sortOrder === 'newest' ? "mdi:sort-calendar-descending" : "mdi:sort-calendar-ascending"} />}
          >
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:refresh" />}
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!userEmail && !showAll && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please log in to see your notifications
        </Alert>
      )}

      {userNotifications.length === 0 && !error ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="mdi:bell-outline" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {notifications.length > 0 ? 'No matching notifications' : 'No notifications yet'}
              </Typography>
              <Typography color="text.secondary">
                {notifications.length > 0 
                  ? `Showing ${showAll ? 'all' : 'your'} notifications. Found ${notifications.length} total.`
                  : "You'll see your notifications here when they arrive"
                }
              </Typography>
              {notifications.length > 0 && !showAll && (
                <Button 
                  sx={{ mt: 2 }}
                  variant="outlined" 
                  onClick={() => setShowAll(true)}
                >
                  Show All Notifications
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {userNotifications.map((notification) => (
            <Card 
              key={notification.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[8],
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
              onClick={() => handleOpenNotification(notification)}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: `${getTypeColor(notification.type)}.light` }}>
                    <Iconify icon={getTypeIcon(notification.type)} />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={getTypeColor(notification.type) as any}
                        variant="outlined"
                      />
                      <Chip
                        label={notification.status}
                        size="small"
                        color={getStatusColor(notification.status) as any}
                      />
                    </Stack>
                    
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {stripHtml(notification.body)}
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" color="text.disabled">
                        {formatDate(notification.createdAt)}
                      </Typography>
                      <IconButton size="small" sx={{ ml: 'auto' }}>
                        <Iconify icon="mdi:chevron-right" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      {/* Detail Drawer - Mail App Style */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 480, md: 600 } }
        }}
      >
        {selectedNotification && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                bgcolor: 'background.neutral'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={handleCloseDrawer}>
                  <Iconify icon="mdi:close" />
                </IconButton>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  Notification Details
                </Typography>
                <IconButton size="small">
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              </Stack>
            </Box>
            
            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Stack spacing={3}>
                {/* Title with Icon */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      bgcolor: `${getTypeColor(selectedNotification.type)}.light` 
                    }}
                  >
                    <Iconify 
                      icon={getTypeIcon(selectedNotification.type)} 
                      sx={{ fontSize: 32 }}
                    />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedNotification.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <Chip
                        label={selectedNotification.type}
                        size="small"
                        color={getTypeColor(selectedNotification.type) as any}
                      />
                      <Chip
                        label={selectedNotification.status}
                        size="small"
                        color={getStatusColor(selectedNotification.status) as any}
                      />
                    </Stack>
                  </Box>
                </Stack>
                
                <Divider />
                
                {/* Meta Information */}
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:email-outline" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      To:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {selectedNotification.toEmail}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:clock-outline" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Sent:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(selectedNotification.createdAt)}
                    </Typography>
                  </Stack>
                  
                  {selectedNotification.updatedAt !== selectedNotification.createdAt && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:update" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Updated:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(selectedNotification.updatedAt)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                
                <Divider />
                
                {/* Body Content */}
                <Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {stripHtml(selectedNotification.body)}
                  </Typography>
                </Box>
                
                {/* Additional Data */}
                {selectedNotification.data && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Additional Information
                      </Typography>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                          {JSON.stringify(selectedNotification.data, null, 2)}
                        </pre>
                      </Card>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
            
            {/* Footer Actions */}
            <Box 
              sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                bgcolor: 'background.neutral'
              }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:reply" />}
                  fullWidth
                >
                  Reply
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:archive-outline" />}
                  fullWidth
                >
                  Archive
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}
'use client'

import { useState, useEffect } from 'react'
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
  Avatar
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { getNotificationsRequest, NotificationData } from '@/requests/notifications/notifications.requests'

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await getNotificationsRequest()
      if (response.error) {
        setError(response.message || 'Failed to load notifications')
      } else {
        setNotifications(response.data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load notifications')
      enqueueSnackbar('Failed to load notifications', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'mdi:calendar-clock'
      case 'visit-record':
        return 'mdi:file-document'
      case 'registration':
        return 'mdi:account-plus'
      default:
        return 'mdi:bell'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'primary'
      case 'visit-record':
        return 'info'
      case 'registration':
        return 'success'
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
        <Typography variant="h4">Notifications</Typography>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:refresh" />}
          onClick={fetchNotifications}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {notifications.length === 0 && !error ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="mdi:bell-outline" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography color="text.secondary">
                You&apos;ll see your notifications here when they arrive
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              sx={{
                border: notification.isRead ? 'none' : '2px solid',
                borderColor: notification.isRead ? 'transparent' : 'primary.main',
                opacity: notification.isRead ? 0.8 : 1
              }}
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
                      {!notification.isRead && (
                        <Chip label="New" size="small" color="primary" />
                      )}
                    </Stack>
                    
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {notification.message}
                    </Typography>
                    
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
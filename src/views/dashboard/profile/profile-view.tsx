'use client'

import { useAppSelector } from '@/redux/store'
import { getRoleDisplayName, getRoleColor } from '@/utils/role.utils'
import { getUserDisplayName } from '@/utils/user'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'

// Material Icons
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import CakeIcon from '@mui/icons-material/Cake'
import BadgeIcon from '@mui/icons-material/Badge'
import WcIcon from '@mui/icons-material/Wc'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

// ----------------------------------------------------------------------

export default function ProfileView() {
  const user = useAppSelector((state) => state.auth.user)
  const userRole = useAppSelector((state) => state.auth.userRole)

  const roleColor = getRoleColor(userRole)
  const roleDisplayName = getRoleDisplayName(userRole)

  // Get role icon
  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
      case 'doctor':
        return <LocalHospitalIcon sx={{ fontSize: 24 }} />
      case 'patient':
        return <PersonIcon sx={{ fontSize: 24 }} />
      default:
        return <PersonIcon sx={{ fontSize: 24 }} />
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Format gender
  const formatGender = (gender?: number) => {
    if (gender === 1) return 'Male'
    if (gender === 2) return 'Female'
    return 'Not specified'
  }

  // Get user initials for avatar
  const getInitials = () => {
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No user information available
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header Card */}
        <Card 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(roleColor, 0.1)} 0%, ${alpha(roleColor, 0.05)} 100%)`,
            border: `1px solid ${alpha(roleColor, 0.2)}`
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: roleColor,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                  {getUserDisplayName(user)}
                </Typography>
                
                <Chip
                  icon={getRoleIcon()}
                  label={roleDisplayName}
                  size="medium"
                  sx={{
                    height: 32,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderColor: alpha(roleColor, 0.3),
                    color: roleColor,
                    backgroundColor: alpha(roleColor, 0.1),
                    '& .MuiChip-icon': {
                      color: roleColor,
                    },
                  }}
                  variant="outlined"
                />
              </Box>

              <VerifiedUserIcon 
                sx={{ 
                  fontSize: 40, 
                  color: user.isActive ? 'success.main' : 'error.main',
                  opacity: 0.7 
                }} 
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Information Cards Grid */}
        <Grid container spacing={3}>
          {/* Personal Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Personal Information
                </Typography>
                
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.email || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.phoneNumber || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CakeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(user.dateOfBirth)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WcIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatGender(user.gender)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Address & Identity Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon color="primary" />
                  Address & Identity
                </Typography>
                
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HomeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.address || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">IDNP</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.idnp || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">User ID</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.id || 'Not available'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <VerifiedUserIcon 
                      sx={{ 
                        color: user.isActive ? 'success.main' : 'error.main', 
                        fontSize: 20 
                      }} 
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Account Status</Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          color: user.isActive ? 'success.main' : 'error.main'
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Role-Specific Information Card */}
          {userRole === 'admin' && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon color="error" />
                    Administrator Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 600 }}>
                          Full Access
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          System Administration
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 600 }}>
                          All Roles
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          User Management
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 600 }}>
                          Security
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          System Security
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {userRole === 'doctor' && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon color="primary" />
                    Doctor Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#2196f3', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 600 }}>
                          Medical
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Healthcare Provider
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#2196f3', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 600 }}>
                          Patients
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Patient Care
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#2196f3', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 600 }}>
                          Records
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Medical Records
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {userRole === 'patient' && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="success" />
                    Patient Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#4caf50', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 600 }}>
                          Health
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Personal Health
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#4caf50', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 600 }}>
                          Records
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Medical History
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#4caf50', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 600 }}>
                          Care
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Healthcare Access
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  )
}
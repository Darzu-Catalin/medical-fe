/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'
// @mui
import LoadingButton from '@mui/lab/LoadingButton'

// routes
import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

// hooks
import { enqueueSnackbar } from 'notistack'

// requests
import { changePasswordWithTokenRequest } from '@/requests/auth/auth.requests'

// components
import FormProvider, { RHFTextField } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordMandatoryView() {
  const [errorMsg, setErrorMsg] = useState('')
  const [email, setEmail] = useState('')
  const [passwordChangeToken, setPasswordChangeToken] = useState('')
  const [user, setUser] = useState<any>(null)
  
  const router = useRouter()

  // Get data from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('passwordChangeEmail')
    const storedToken = sessionStorage.getItem('passwordChangeToken')
    const storedUser = sessionStorage.getItem('passwordChangeUser')

    if (!storedEmail || !storedToken) {
      enqueueSnackbar('Invalid session. Please login again.', { variant: 'error' })
      router.replace(paths.auth.login)
      return
    }

    setEmail(storedEmail)
    setPasswordChangeToken(storedToken)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [router])

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
      .required('Confirm password is required'),
  })

  const defaultValues: FormValuesProps = {
    newPassword: '',
    confirmPassword: '',
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        setErrorMsg('')

        const response = await changePasswordWithTokenRequest({
          email,
          passwordChangeToken,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        })

        if (response.error) {
          setErrorMsg(response.message || 'Failed to change password')
          
          // If token expired or invalid, redirect to login
          if (response.message?.toLowerCase().includes('expired') || 
              response.message?.toLowerCase().includes('invalid')) {
            setTimeout(() => {
              sessionStorage.removeItem('passwordChangeEmail')
              sessionStorage.removeItem('passwordChangeToken')
              sessionStorage.removeItem('passwordChangeUser')
              router.replace(paths.auth.login)
            }, 3000)
          }
          return
        }

        // Success - clear session storage and redirect to login
        enqueueSnackbar('Password changed successfully! Please login with your new password.', { 
          variant: 'success' 
        })
        
        sessionStorage.removeItem('passwordChangeEmail')
        sessionStorage.removeItem('passwordChangeToken')
        sessionStorage.removeItem('passwordChangeUser')
        
        setTimeout(() => {
          router.replace(paths.auth.login)
        }, 1500)

      } catch (error) {
        console.error(error)
        setErrorMsg(typeof error === 'string' ? error : error.message)
      }
    },
    [email, passwordChangeToken, router]
  )

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          color: "white"
        }}
      >
        Set Your New Password
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Security Notice:</strong> Your temporary password must be changed before you can access the system.
      </Alert>

      {user && (
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)' 
          }}
        >
          Changing password for: <strong style={{ color: 'white' }}>{user.email}</strong>
        </Typography>
      )}
    </Stack>
  )

  const renderForm = (
    <Stack
      spacing={2.5}
      sx={{
        minWidth: '320px',
      }}
    >
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField
        name="newPassword"
        label="New Password"
        type="password"
        inputProps={{ minLength: 6 }}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px) saturate(140%)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            borderRadius: 2,
            '&.Mui-focused': {
              background: 'rgba(255,255,255,0.06)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.24)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.48)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.light,
              boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.light, 0.35)}`,
            },
          },
          '& .MuiInputBase-input': {
            color: theme.palette.common.white,
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.72)',
            '&.Mui-focused': {
              color: 'rgba(255,255,255,0.72)',
            },
          },
        })}
      />

      <RHFTextField
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px) saturate(140%)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            borderRadius: 2,
            '&.Mui-focused': {
              background: 'rgba(255,255,255,0.06)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.24)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.48)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.light,
              boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.light, 0.35)}`,
            },
          },
          '& .MuiInputBase-input': {
            color: theme.palette.common.white,
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.72)',
            '&.Mui-focused': {
              color: 'rgba(255,255,255,0.72)',
            },
          },
        })}
      />

      <Typography 
        variant="caption" 
        sx={{ 
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          mt: 1
        }}
      >
        Password must be at least 6 characters long
      </Typography>

      <LoadingButton
        disabled={!isValid}
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ borderRadius: 2, mt: 2 }}
      >
        Set New Password
      </LoadingButton>

      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          mt: 2
        }}
      >
        After changing your password, you will be redirected to login.
      </Typography>
    </Stack>
  )

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '500px',
          mx: 'auto',
        }}
      >
        {renderHead}
        {renderForm}
      </Box>
    </FormProvider>
  )
}

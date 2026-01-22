/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback, useRef, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { setInitialEmail } from '@/redux/slices/app-settings'
import { useAppDispatch, useAppSelector, store } from 'src/redux/store'
import { loginAsync } from '@/redux/slices/auth'
import { getPathAfterLogin } from '@/config-global'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box, Link, TextField } from '@mui/material'
import { alpha } from '@mui/material/styles'
// @mui
import LoadingButton from '@mui/lab/LoadingButton'

// routes
import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'
import { useRouter, useSearchParams } from 'src/routes/hooks'

// hooks

import { enqueueSnackbar } from 'notistack'
// validation
import { validateEmailInput } from '@/utils/validationUtils'
import { 
  verifyCodeLoginRequest, 
  loginUserRequest, 
  sendLoginOtpRequest, 
  verifyLoginOtpRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  changePasswordWithTokenRequest
} from '@/requests/auth/auth.requests'
import { setSession } from '@/auth/context/utils'
import { setUser, setPermissions, setToken } from '@/redux/slices/auth'

// config
// config

// components
import FormProvider, { RHFTextField, RHFCode } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string
  password: string
}

type MFAFormValues = {
  code: string
}

type ForgotPasswordEmailForm = {
  email: string
}

type ForgotPasswordResetForm = {
  // resetCode is handled via local state
  newPassword: string
  confirmPassword: string
}

type MandatoryPasswordChangeForm = {
  newPassword: string
  confirmNewPassword: string
}

export default function LoginView() {
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'admin' | null>(null)
  const [showMFAVerification, setShowMFAVerification] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'reset'>('email')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordResetCode, setForgotPasswordResetCode] = useState('')
  const [mfaEmail, setMfaEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [secondsAfterEmailSent, setSecondsAfterEmailSent] = useState(0)
  // Mandatory password change state (for doctors with temp passwords)
  const [showMandatoryPasswordChange, setShowMandatoryPasswordChange] = useState(false)
  const [passwordChangeToken, setPasswordChangeToken] = useState('')
  const [passwordChangeUserData, setPasswordChangeUserData] = useState<any>(null)
  
  const splashTimerRef = useRef<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const userRole = useAppSelector((state) => state.auth.userRole)
  const returnTo = searchParams.get('returnTo')


  const LoginSchema = Yup.object().shape({
    email: Yup.string().trim().lowercase().required('E obligatoriu').email('Email invalid'),
    password: Yup.string().required('E obligatoriu'),
  })

  const MFASchema = Yup.object().shape({
    code: Yup.string().required('E obligatoriu'),
  })

  const ForgotPasswordEmailSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .required('Email is required')
      .email('Invalid email address'),
  })

  const ForgotPasswordResetSchema = Yup.object().shape({
    // resetCode is handled via local state (forgotPasswordResetCode)
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
      .required('Confirm password is required'),
  })

  const MandatoryPasswordChangeSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
      .required('Confirm password is required'),
  })

  const defaultValues: FormValuesProps = {
    email: '',
    password: '',
  }

  const mfaDefaultValues: MFAFormValues = {
    code: '',
  }

  const forgotPasswordEmailDefaults: ForgotPasswordEmailForm = {
    email: '',
  }

  const forgotPasswordResetDefaults: ForgotPasswordResetForm = {
    // resetCode is handled via local state
    newPassword: '',
    confirmPassword: '',
  }

  const mandatoryPasswordChangeDefaults: MandatoryPasswordChangeForm = {
    newPassword: '',
    confirmNewPassword: '',
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  })

  const mfaMethods = useForm<MFAFormValues>({
    resolver: yupResolver(MFASchema),
    defaultValues: mfaDefaultValues,
  })

  const forgotPasswordEmailMethods = useForm<ForgotPasswordEmailForm>({
    resolver: yupResolver(ForgotPasswordEmailSchema),
    defaultValues: forgotPasswordEmailDefaults,
  })

  const forgotPasswordResetMethods = useForm<ForgotPasswordResetForm>({
    resolver: yupResolver(ForgotPasswordResetSchema),
    mode: 'onSubmit',
    defaultValues: forgotPasswordResetDefaults,
  })

  const mandatoryPasswordChangeMethods = useForm<MandatoryPasswordChangeForm>({
    resolver: yupResolver(MandatoryPasswordChangeSchema),
    defaultValues: mandatoryPasswordChangeDefaults,
  })

  // Countdown timer for resend button
  useEffect(() => {
    if (emailSent) {
      setTimeout(() => {
        setSecondsAfterEmailSent((prev) => prev + 1)
      }, 1000)
    }

    if (secondsAfterEmailSent === 60) {
      setEmailSent(false)
      setSecondsAfterEmailSent(0)
    }
  }, [emailSent, secondsAfterEmailSent])

  const sendMFACode = useCallback(async (email: string) => {
    try {
      // Use the proper MFA endpoint for login
      const response = await sendLoginOtpRequest({ email })
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to send verification code', { variant: 'error' })
        return false
      }
      
      enqueueSnackbar('Verification code sent to your email', { variant: 'success' })
      setEmailSent(true)
      setSecondsAfterEmailSent(0)
      return true
    } catch (error) {
      console.error('Error sending MFA code:', error)
      enqueueSnackbar('Failed to send verification code', { variant: 'error' })
      return false
    }
  }, [])

  const handleResendCode = useCallback(async () => {
    setEmailLoading(true)
    await sendMFACode(mfaEmail)
    setEmailLoading(false)
  }, [mfaEmail, sendMFACode])


  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const {
    handleSubmit: handleMFASubmit,
    formState: { isSubmitting: isMFASubmitting, isValid: isMFAValid },
  } = mfaMethods

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        // Call login API directly without Redux to avoid auto-login
        const loginResponse = await loginUserRequest({ 
          email: data.email, 
          password: data.password 
        })
        
        if (loginResponse.error) {
          enqueueSnackbar(loginResponse.message || 'Eroare la autentificare', { variant: 'error' })
          return
        }
        
        // After successful login credentials check, send MFA code
        setMfaEmail(data.email)
        const codeSent = await sendMFACode(data.email)
        
        if (codeSent) {
          // Switch to MFA verification view
          setShowMFAVerification(true)
        }
        
      } catch (error) {
        console.error(error)
        setErrorMsg(typeof error === 'string' ? error : error.message)
      }
    },
    [sendMFACode]
  )

  const onMFASubmit = useCallback(
    async (data: MFAFormValues) => {
      setErrorMsg('')
      try {
        // Use the proper MFA verification endpoint
        const result = await verifyLoginOtpRequest({
          otp: data.code,
          email: mfaEmail,
        })

        if (result.error) {
          setErrorMsg(result.message || 'Invalid verification code')
          return
        }

        // Check if password change is required (for doctors with temp passwords)
        if (result.data && result.data.requiresPasswordChange) {
          enqueueSnackbar('You must change your temporary password', { variant: 'info' })
          
          // Show inline mandatory password change (same style as MFA/forgot password)
          setPasswordChangeToken(result.data.passwordChangeToken || '')
          setPasswordChangeUserData(result.data.user)
          setShowMFAVerification(false)
          setShowMandatoryPasswordChange(true)
          
          return
        }

        // Handle successful MFA verification - normal flow
        if (result.data && result.data.token && result.data.user) {
          enqueueSnackbar('Login successful!', { variant: 'success' })

          // Set authentication data in Redux and session
          dispatch(setUser(result.data.user))
          
          // Set permissions
          const perms = Array.isArray(result.data.user.roles) && result.data.user.roles.length > 0
            ? result.data.user.roles
            : ['*']
          dispatch(setPermissions(perms))
          
          // Set session token
          setSession(result.data.token)
          dispatch(setToken(result.data.token))

          // Get user role for navigation
          const userRole = result.data.user.roles && result.data.user.roles.length > 0 
            ? result.data.user.roles[0].toLowerCase()
            : 'patient'
          
          // Navigate to role-specific dashboard
          const redirectPath = returnTo || getPathAfterLogin(userRole as any)
          router.replace(redirectPath)
        }
      } catch (error) {
        console.error('MFA verification error:', error)
        setErrorMsg(error.message || 'Verification failed')
      }
    },
    [mfaEmail, dispatch, returnTo, router]
  )

  // Forgot Password Handlers
  const onForgotPasswordEmailSubmit = useCallback(
    async (data: ForgotPasswordEmailForm) => {
      try {
        setErrorMsg('')
        const response = await forgotPasswordRequest({ email: data.email })

        // Always show success message (security - don't reveal if email exists)
        enqueueSnackbar(
          'If the email exists in our system, a reset code has been sent.',
          { variant: 'success' }
        )

        // Move to reset step and store email
        setForgotPasswordEmail(data.email)
        setForgotPasswordStep('reset')
      } catch (error) {
        console.error('Forgot password error:', error)
        setErrorMsg(error.message || 'Failed to send reset code')
      }
    },
    []
  )

  const onForgotPasswordResetSubmit = useCallback(
    async (data: ForgotPasswordResetForm) => {
      try {
        setErrorMsg('')

        // Manual validation - use local state for resetCode
        if (!forgotPasswordResetCode || forgotPasswordResetCode.length !== 6) {
          setErrorMsg('Please enter a 6-digit reset code')
          return
        }

        if (!data.newPassword || data.newPassword.length < 6) {
          setErrorMsg('Password must be at least 6 characters')
          return
        }

        if (data.newPassword !== data.confirmPassword) {
          setErrorMsg('Passwords do not match')
          return
        }

        const response = await resetPasswordRequest({
          email: forgotPasswordEmail,
          resetCode: forgotPasswordResetCode,  // Use local state
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        })

        if (response.error) {
          setErrorMsg(response.message || 'Failed to reset password')
          return
        }

        enqueueSnackbar('Password reset successful! Please login with your new password.', {
          variant: 'success',
        })

        // Reset back to login view
        setShowForgotPassword(false)
        setForgotPasswordStep('email')
        setForgotPasswordResetCode('')
        forgotPasswordEmailMethods.reset()
        forgotPasswordResetMethods.reset()
      } catch (error) {
        console.error('Reset password error:', error)
        setErrorMsg(error.message || 'Failed to reset password')
      }
    },
    [forgotPasswordEmail, forgotPasswordResetCode, forgotPasswordEmailMethods, forgotPasswordResetMethods]
  )

  const onMandatoryPasswordChangeSubmit = useCallback(
    async (data: MandatoryPasswordChangeForm) => {
      try {
        setErrorMsg('')

        const response = await changePasswordWithTokenRequest({
          email: mfaEmail,
          passwordChangeToken,
          newPassword: data.newPassword,
          confirmPassword: data.confirmNewPassword,
        })

        if (response.error) {
          setErrorMsg(response.message || 'Failed to change password')
          return
        }

        enqueueSnackbar('Password changed successfully! Please login with your new password.', {
          variant: 'success',
        })

        // Reset back to login view
        setShowMandatoryPasswordChange(false)
        setPasswordChangeToken('')
        setPasswordChangeUserData(null)
        mandatoryPasswordChangeMethods.reset()
      } catch (error) {
        console.error('Change password error:', error)
        setErrorMsg(error.message || 'Failed to change password')
      }
    },
    [mfaEmail, passwordChangeToken, mandatoryPasswordChangeMethods]
  )

  const handleBackToLogin = useCallback(() => {
    setShowForgotPassword(false)
    setShowMFAVerification(false)
    setShowMandatoryPasswordChange(false)
    setForgotPasswordStep('email')
    setForgotPasswordResetCode('')
    setPasswordChangeToken('')
    setPasswordChangeUserData(null)
    setErrorMsg('')
    forgotPasswordEmailMethods.reset()
    forgotPasswordResetMethods.reset()
    mandatoryPasswordChangeMethods.reset()
  }, [forgotPasswordEmailMethods, forgotPasswordResetMethods, mandatoryPasswordChangeMethods])

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: -2,
          color: "white"
        }}
      >
        Login
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" color = "white" >Don't have an account?</Typography>

        <Link component={RouterLink} href={paths.auth.register} variant="subtitle2" color={"white"} sx={{ "&:hover": { color: "#166bd4ff", textDecoration: 'none' } }}>
          Create one
        </Link>
      </Stack>
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
    name="email"
    label="Email"
    type="email"
    inputProps={{ onInput: validateEmailInput, inputMode: 'email', autoComplete: 'email' }}
    sx={(theme) => ({
      '& .MuiOutlinedInput-root': {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        borderRadius: 2,
        // keep background on focus as is
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
      // keep label color unchanged on focus
      '& .MuiInputLabel-root': {
        color: 'rgba(255,255,255,0.72)',
        '&.Mui-focused': {
          color: 'rgba(255,255,255,0.72)',
        },
      },
      // override Chrome autofill background from white to glass
      '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
        WebkitTextFillColor: theme.palette.common.white,
        caretColor: theme.palette.common.white,
        transition: 'background-color 9999s ease-in-out 0s',
      },
    })}
  />

  <RHFTextField
    name="password"
    label="Password"
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
      '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
        WebkitTextFillColor: theme.palette.common.white,
        caretColor: theme.palette.common.white,
        transition: 'background-color 9999s ease-in-out 0s',
      },
    })}
  />

  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1, mb: 1 }}>
    <Link
      component="button"
      type="button"
      variant="caption"
      color="white"
      onClick={() => {
        setShowForgotPassword(true)
        setErrorMsg('')
      }}
      sx={{ 
        '&:hover': { color: '#166bd4ff', textDecoration: 'none' },
        cursor: 'pointer',
        border: 'none',
        background: 'none'
      }}
    >
      Forgot password?
    </Link>
  </Box>

      <LoadingButton
        disabled={!isValid}
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ borderRadius: 2 }}
      >
        Login
      </LoadingButton>
      
      <Box
        sx={{
          mb: 1,
          mt: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <LoadingButton
          fullWidth
          color={selectedRole === 'patient' ? 'primary' : 'inherit'}
          size="small"
          type="button"
          variant={selectedRole === 'patient' ? 'contained' : 'outlined'}
          onClick={() => {
            methods.setValue('email', 'patient@example.com', { shouldDirty: true, shouldValidate: true })
            methods.setValue('password', 'Qwerty1.', { shouldDirty: true, shouldValidate: true })
            setSelectedRole('patient')
          }}
          sx={(theme) => ({
            transition: 'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
            '&.MuiButton-outlined, &.MuiButton-outlinedInherit': {
              color: 'rgba(255,255,255,0.92)',
              borderColor: 'rgba(255,255,255,0.32)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
            '&.MuiButton-containedPrimary': {
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            },
          })}
        >
          Patient
        </LoadingButton>

        <LoadingButton
          fullWidth
          color={selectedRole === 'doctor' ? 'success' : 'inherit'}
          size="small"
          type="button"
          variant={selectedRole === 'doctor' ? 'contained' : 'outlined'}
          onClick={() => {
            methods.setValue('email', 'vanea@gmail.com', { shouldDirty: true, shouldValidate: true })
            methods.setValue('password', 'Qwerty1.', { shouldDirty: true, shouldValidate: true })
            setSelectedRole('doctor')
          }}
          sx={(theme) => ({
            mx: 1,
            transition: 'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
            '&.MuiButton-outlined, &.MuiButton-outlinedInherit': {
              color: 'rgba(255,255,255,0.92)',
              borderColor: 'rgba(255,255,255,0.32)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            },
            '&.MuiButton-containedPrimary': {
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            },
          })}
        >
          Doctor
        </LoadingButton>

        <LoadingButton
          fullWidth
          color={selectedRole === 'admin' ? 'error' : 'inherit'}
          size="small"
          type="button"
          variant={selectedRole === 'admin' ? 'contained' : 'outlined'}
          onClick={() => {
            methods.setValue('email', 'administrator@example.com', { shouldDirty: true, shouldValidate: true })
            methods.setValue('password', 'Qwerty1.', { shouldDirty: true, shouldValidate: true })
            setSelectedRole('admin')
          }}
          sx={(theme) => ({
            transition: 'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
            '&.MuiButton-outlined, &.MuiButton-outlinedInherit': {
              color: 'rgba(255,255,255,0.92)',
              borderColor: 'rgba(255,255,255,0.32)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            },
            '&.MuiButton-containedPrimary': {
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            },
          })}
        >
          Administrator
        </LoadingButton>
      </Box>
    </Stack>
  )

  const renderMFAVerification = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        mx: 'auto',
      }}
    >
      {/* Head */}
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          Verify Your Email
        </Typography>

        <Stack spacing={0.5}>
          <Typography
            variant="body1"
            sx={{
              mt: -2,
              textAlign: 'center',
              mb: -1,
              color: 'white',
            }}
          >
            We've sent a verification code to: <b>{mfaEmail}</b>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            Please check your email and spam folder
          </Typography>
        </Stack>
      </Stack>

      {/* Body */}
      <Stack
        spacing={2.5}
        sx={{
          minWidth: '320px',
        }}
      >
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          sx={{
            mx: 'auto',
            maxWidth: '350px',
          }}
        >
          <RHFCode 
            name="code" 
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            TextFieldsProps={{
              sx: {
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }
            }}
          />

          <LoadingButton
            sx={{
              mt: 4,
              mb: 1,
            }}
            fullWidth
            disabled={emailSent}
            color="primary"
            size="large"
            type="button"
            variant="text"
            loading={emailLoading}
            onClick={handleResendCode}
          >
            Resend code {(emailSent && `(${60 - secondsAfterEmailSent})`) || ''}
          </LoadingButton>

          <LoadingButton
            fullWidth
            disabled={!isMFAValid}
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isMFASubmitting}
            sx={{ borderRadius: 2 }}
          >
            Verify Code
          </LoadingButton>
        </Box>
      </Stack>
    </Box>
  )

  const renderForgotPasswordEmail = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        mx: 'auto',
      }}
    >
      {/* Head */}
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          Forgot Password
        </Typography>

        <Stack spacing={0.5}>
          <Typography
            variant="body1"
            sx={{
              mt: -2,
              textAlign: 'center',
              mb: -1,
              color: 'white',
            }}
          >
            Enter your email to receive a reset code
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            Please check your email and spam folder
          </Typography>
        </Stack>
      </Stack>

      {/* Body */}
      <Stack
        spacing={2.5}
        sx={{
          minWidth: '320px',
        }}
      >
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          sx={{
            mx: 'auto',
            maxWidth: '350px',
          }}
        >
          <RHFTextField
            name="email"
            label="Email Address"
            type="email"
            inputProps={{ 
              onInput: validateEmailInput, 
              inputMode: 'email', 
              autoComplete: 'email' 
            }}
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <LoadingButton
            sx={{
              mt: 4,
              mb: 1,
            }}
            disabled={!forgotPasswordEmailMethods.formState.isValid}
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={forgotPasswordEmailMethods.formState.isSubmitting}
          >
            Send Reset Code
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="white"
              onClick={handleBackToLogin}
              sx={{ 
                '&:hover': { color: '#166bd4ff', textDecoration: 'none' },
                cursor: 'pointer',
                border: 'none',
                background: 'none'
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Stack>
    </Box>
  )

  const renderForgotPasswordReset = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        mx: 'auto',
      }}
    >
      {/* Head */}
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          Reset Password
        </Typography>

        <Stack spacing={0.5}>
          <Typography
            variant="body1"
            sx={{
              mt: -2,
              textAlign: 'center',
              mb: -1,
              color: 'white',
            }}
          >
            Enter the code sent to: <b>{forgotPasswordEmail}</b>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            Check your email and spam folder for the 6-digit code
          </Typography>
        </Stack>
      </Stack>

      {/* Body */}
      <Stack
        spacing={2.5}
        sx={{
          minWidth: '320px',
        }}
      >
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          sx={{
            mx: 'auto',
            maxWidth: '350px',
          }}
        >
          <TextField
            fullWidth
            label="Reset Code (6 digits)"
            type="text"
            value={forgotPasswordResetCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setForgotPasswordResetCode(val);
            }}
            inputProps={{ 
              maxLength: 6,
              inputMode: 'numeric',
              autoComplete: 'off'
            }}
            sx={(theme) => ({
              mb: 2,
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <RHFTextField
            name="newPassword"
            label="New Password"
            type="password"
            inputProps={{ minLength: 6 }}
            sx={(theme) => ({
              mb: 2,
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <RHFTextField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            sx={(theme) => ({
              mb: 2,
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <LoadingButton
            sx={{
              mt: 4,
              mb: 1,
            }}
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={forgotPasswordResetMethods.formState.isSubmitting}
          >
            Reset Password
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="white"
              onClick={() => setForgotPasswordStep('email')}
              sx={{ 
                '&:hover': { color: '#166bd4ff', textDecoration: 'none' },
                cursor: 'pointer',
                border: 'none',
                background: 'none'
              }}
            >
              Use different email
            </Link>
          </Box>
        </Box>
      </Stack>
    </Box>
  )

  const renderMandatoryPasswordChange = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        mx: 'auto',
      }}
    >
      {/* Head */}
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          Change Your Password
        </Typography>

        <Stack spacing={0.5}>
          <Typography
            variant="body1"
            sx={{
              mt: -2,
              textAlign: 'center',
              mb: -1,
              color: 'white',
            }}
          >
            Your account requires a password change
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            Please set a new secure password to continue
          </Typography>
        </Stack>
      </Stack>

      {/* Body */}
      <Stack
        spacing={2.5}
        sx={{
          minWidth: '320px',
        }}
      >
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box
          sx={{
            mx: 'auto',
            maxWidth: '350px',
          }}
        >
          <RHFTextField
            name="newPassword"
            label="New Password"
            type="password"
            inputProps={{ minLength: 6 }}
            sx={(theme) => ({
              mb: 2,
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <RHFTextField
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            sx={(theme) => ({
              mb: 2,
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
              '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px rgba(255,255,255,0.06) inset',
                WebkitTextFillColor: theme.palette.common.white,
                caretColor: theme.palette.common.white,
                transition: 'background-color 9999s ease-in-out 0s',
              },
            })}
          />

          <LoadingButton
            sx={{
              mt: 4,
              mb: 1,
            }}
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={mandatoryPasswordChangeMethods.formState.isSubmitting}
          >
            Change Password
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="white"
              onClick={handleBackToLogin}
              sx={{ 
                '&:hover': { color: '#166bd4ff', textDecoration: 'none' },
                cursor: 'pointer',
                border: 'none',
                background: 'none'
              }}
            >
              Back to login
            </Link>
          </Box>
        </Box>
      </Stack>
    </Box>
  )

  return (
    <>
      {showMandatoryPasswordChange ? (
        // Mandatory Password Change Flow
        <FormProvider methods={mandatoryPasswordChangeMethods} onSubmit={mandatoryPasswordChangeMethods.handleSubmit(onMandatoryPasswordChangeSubmit)}>
          {renderMandatoryPasswordChange}
        </FormProvider>
      ) : showForgotPassword ? (
        // Forgot Password Flow
        forgotPasswordStep === 'email' ? (
          <FormProvider methods={forgotPasswordEmailMethods} onSubmit={forgotPasswordEmailMethods.handleSubmit(onForgotPasswordEmailSubmit)}>
            {renderForgotPasswordEmail}
          </FormProvider>
        ) : (
          <FormProvider methods={forgotPasswordResetMethods} onSubmit={forgotPasswordResetMethods.handleSubmit(onForgotPasswordResetSubmit)}>
            {renderForgotPasswordReset}
          </FormProvider>
        )
      ) : showMFAVerification ? (
        // MFA Verification Flow
        <FormProvider methods={mfaMethods} onSubmit={handleMFASubmit(onMFASubmit)}>
          {renderMFAVerification}
        </FormProvider>
      ) : (
        // Login Flow
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {renderHead}
          {renderForm}
        </FormProvider>
      )}
    </>
  )
}

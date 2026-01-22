/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

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
import { useRouter } from 'src/routes/hooks'

// hooks
import { enqueueSnackbar } from 'notistack'

// validation
import { validateEmailInput } from '@/utils/validationUtils'

// requests
import { forgotPasswordRequest, resetPasswordRequest } from '@/requests/auth/auth.requests'

// components
import FormProvider, { RHFTextField } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type EmailFormValues = {
  email: string
}

type ResetFormValues = {
  resetCode: string
  newPassword: string
  confirmPassword: string
}

export default function ForgotPasswordView() {
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  
  const router = useRouter()

  // Email form schema
  const EmailSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .required('Email is required')
      .email('Invalid email address'),
  })

  // Reset password form schema
  const ResetSchema = Yup.object().shape({
    resetCode: Yup.string()
      .required('Reset code is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
      .required('Confirm password is required'),
  })

  const emailMethods = useForm<EmailFormValues>({
    resolver: yupResolver(EmailSchema),
    defaultValues: { email: '' },
  })

  const resetMethods = useForm<ResetFormValues>({
    defaultValues: {
      resetCode: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onEmailSubmit = useCallback(
    async (data: EmailFormValues) => {
      try {
        setErrorMsg('')

        const response = await forgotPasswordRequest({ email: data.email })

        // Always show success message (security - don't reveal if email exists)
        enqueueSnackbar(
          'If the email exists in our system, a reset code has been sent.',
          { variant: 'success' }
        )

        // Store email and move to next step
        setEmail(data.email)
        setStep('reset')

      } catch (error) {
        console.error(error)
        setErrorMsg(typeof error === 'string' ? error : error.message)
      }
    },
    []
  )

  const onResetSubmit = useCallback(
    async (data: ResetFormValues) => {
      try {
        setErrorMsg('')

        // Manual validation - use local resetCode state
        if (!resetCode || resetCode.length !== 6) {
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
          email,
          resetCode: resetCode,  // Use local state
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

        setTimeout(() => {
          router.replace(paths.auth.login)
        }, 1500)

      } catch (error) {
        console.error(error)
        setErrorMsg(typeof error === 'string' ? error : error.message)
      }
    },
    [email, resetCode, router]
  )

  const renderEmailStep = (
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
            disabled={!emailMethods.formState.isValid}
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={emailMethods.formState.isSubmitting}
          >
            Send Reset Code
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component={RouterLink}
              href={paths.auth.login}
              variant="body2"
              color="white"
              sx={{ '&:hover': { color: '#166bd4ff', textDecoration: 'none' } }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Stack>
    </Box>
  )

  const renderResetStep = (
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
            Enter the code sent to: <b>{email}</b>
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
            label="Reset Code (6 digits"
            type="text"
            value={resetCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setResetCode(val);
            }}
            inputProps={{ 
              maxLength: 6,
              inputMode: 'numeric',
              autoComplete: 'off',
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
            loading={resetMethods.formState.isSubmitting}
          >
            Reset Password
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="white"
              onClick={() => setStep('email')}
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

  return (
    <>
      {step === 'email' ? (
        <FormProvider methods={emailMethods} onSubmit={emailMethods.handleSubmit(onEmailSubmit)}>
          {renderEmailStep}
        </FormProvider>
      ) : (
        <FormProvider methods={resetMethods} onSubmit={resetMethods.handleSubmit(onResetSubmit)}>
          {renderResetStep}
        </FormProvider>
      )}
    </>
  )
}

/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { setInitialEmail } from '@/redux/slices/app-settings'
import { useAppDispatch } from 'src/redux/store'
import { loginAsync } from '@/redux/slices/auth'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box, Link } from '@mui/material'
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
import { getVerificationCodeRequest } from '@/requests/admin/user.requests'

// config
// config

// components
import FormProvider, { RHFTextField } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string
  password: string
}

export default function LoginView() {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const returnTo = searchParams.get('returnTo')


  const LoginSchema = Yup.object().shape({
    email: Yup.string().trim().lowercase().required('E obligatoriu').email('Email invalid'),
    password: Yup.string().required('E obligatoriu'),
  })

  const defaultValues: FormValuesProps = {
    email: '',
    password: '',
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  })


  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const action = await dispatch(loginAsync({ email: data.email, password: data.password }))
        if (loginAsync.rejected.match(action)) {
          const payload = action.payload as any
          enqueueSnackbar(payload?.message || 'Eroare la autentificare', { variant: 'error' })
          return
        }
        router.push(paths.dashboard.root)
      
      } catch (error) {
        console.error(error)
        // reset();
        setErrorMsg(typeof error === 'string' ? error : error.message)
        
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [returnTo]
  )

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
    </Stack>
  )

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}

      {/* <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>demo@minimals.cc</strong> / password :<strong> demo1234</strong>
      </Alert> */}

      {renderForm}
    </FormProvider>
  )
}

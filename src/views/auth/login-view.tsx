/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { setInitialEmail } from '@/redux/slices/app-settings'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box, Link } from '@mui/material'
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
import { useAppDispatch } from 'src/redux/store'

// components
import FormProvider, { RHFTextField } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string
}

export default function LoginView() {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const returnTo = searchParams.get('returnTo')


  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('E obligatoriu').email('Email invalid'),
  })

  const defaultValues = {
    email: '',
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
        const response = await getVerificationCodeRequest(
          {
            email: data.email,
          }
        )


        if (response.error) {
          enqueueSnackbar(response.message, { variant: 'error' })
          return 
        }

        dispatch(setInitialEmail(data.email))
        // go to verification code
        router.push(paths.auth.verifyEmail)
      
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
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography
        variant="h4"
        sx={{
          mb: -2,
        }}
      >
        Loghează-te
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Nu ai cont?</Typography>

        <Link component={RouterLink} href={paths.auth.register} variant="subtitle2">
          Creează unul
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

      <RHFTextField name="email" label="Email" inputProps={{ onInput: validateEmailInput }} />

      {/* 3 autoload users demo button */}
      {/* Admin */}
      {/* eslint-disable-next-line no-constant-condition */}
      {window.location.hostname === 'localhost' ? (
        <>
          <Typography
            variant="caption"
            component="div"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Utilizatori demo
          </Typography>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <LoadingButton
              fullWidth
              disabled
              color="inherit"
              size="small"
              type="button"
              variant="outlined"
              onClick={() => {
                methods.setValue('email', `thegoodplace_agent@ejump.ro`)
                methods.trigger('email')
              }}
            >
              Agent
            </LoadingButton>

            <LoadingButton
              disabled
              fullWidth
              color="inherit"
              size="small"
              type="button"
              sx={{
                mx: 1,
              }}
              variant="outlined"
              onClick={() => {
                methods.setValue('email', `thegoodplace_operator@ejump.ro`)
                methods.trigger('email')
              }}
            >
              Operator
            </LoadingButton>

            <LoadingButton
              fullWidth
              color="inherit"
              size="small"
              type="button"
              variant="outlined"
              onClick={() => {
                methods.setValue('email', `thegoodplace_autonom@ejump.ro`)
                methods.trigger('email')
              }}
            >
              Administrator
            </LoadingButton>
          </Box>
        </>
      ) : null}
      <LoadingButton
        disabled={!isValid}
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
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

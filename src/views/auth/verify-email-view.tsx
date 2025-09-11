/* eslint-disable consistent-return */
/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useCallback } from 'react'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// @mui
import LoadingButton from '@mui/lab/LoadingButton'

// routes
import { useRouter } from 'src/routes/hooks'
// auth

import { useSnackbar } from 'notistack'
import { setSession } from '@/auth/context/utils'
import { setUser, setPermissions } from '@/redux/slices/auth'
import { magicLoginRequest } from '@/requests/auth/auth.requests'
import { verifyCodeLoginRequest } from '@/requests/auth/auth.requests'
import { getVerificationCodeRequest } from '@/requests/admin/user.requests'

import { Box } from '@mui/material'

import { useAppDispatch, useAppSelector } from 'src/redux/store'

// components
import FormProvider, { RHFCode } from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
  code: string
}

export default function VerifyEmailView() {
  const [errorMsg, setErrorMsg] = useState('')

  const initialEmail = useAppSelector((state) => state.app.initialEmail)
  const dispatch = useAppDispatch()

  const router = useRouter()
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [secondsAfterEmailSent, setSecondsAfterEmailSent] = useState(0)

  const VerifySchema = Yup.object().shape({
    code: Yup.string().required('E obligatoriu'),
  })

  const defaultValues = {
    code: '',
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(VerifySchema),
    defaultValues,
  })

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const verifyCode = useCallback(
    async (data: FormValuesProps) => {
      setErrorMsg('')

      try {
        if (!initialEmail) {
          // return to login page
          router.replace('/auth/login')
        }

        console.log('verifyCodeLoginRequest:', verifyCodeLoginRequest)
        const result = await verifyCodeLoginRequest({
          code: data.code,
          email: initialEmail,
        })

        if (result.error) {
          throw new Error(result.message)
        }

        enqueueSnackbar('Emailul a fost validat cu succes!', {
          variant: 'success',
        })

        dispatch(setUser(result.user))
        dispatch(setPermissions(result.permissions))
        setSession(result.token)
        
        // Navigate to dashboard after successful verification
        router.push('/dashboard')
      } catch (error) {
        setErrorMsg(error.message)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // After emailSent is true, count 60 seconds and then set it to false
  // so the user.requests.ts can send another email
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(verifyCode)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
          mx: 'auto',
          mt: 16,
        }}
      >
        {/* Head */}
        <Stack spacing={2} sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
            }}
          >
            Verifică-ți emailul
          </Typography>

          <Stack spacing={0.5}>
            <Typography
              variant="body1"
              sx={{
                mt:-2,
                textAlign: 'center',
                mb: -1,
              }}
            >
              Am trimis un mail de verificare la adresa de email: <b>{initialEmail}</b>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              Te rugăm să verifici emailul și în folderul de spam / promoții / reclame /
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
            <RHFCode name="code" />

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
              onClick={async () => {
                setEmailLoading(true)
                const result = await getVerificationCodeRequest({
                  email: initialEmail,
                })
                setEmailLoading(false)

                if (result.error) {
                  setEmailSent(false)
                  return enqueueSnackbar(result.message, {
                    variant: 'error',
                  })
                }
                setEmailSent(true)
              }}
            >
              Nu am primit codul {(emailSent && `(${60 - secondsAfterEmailSent})`) || ''}
            </LoadingButton>

            <LoadingButton
              fullWidth
              disabled={!isValid}
              color="primary"
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Verifică codul
            </LoadingButton>
          </Box>
        </Stack>
      </Box>
    </FormProvider>
  )
}

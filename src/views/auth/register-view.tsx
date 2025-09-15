/* eslint-disable no-debugger */

'use client'

import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useCallback, useEffect } from 'react'
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
import { validateEmailInput, validatePhoneInput } from '@/utils/validationUtils'
import { getVerificationCodeRequest } from '@/requests/admin/user.requests'
import { registerUserRequest } from '@/requests/auth/auth.requests'

// config
import { useAppDispatch } from 'src/redux/store'

// components
import FormProvider, { RHFTextField, RHFDatePicker} from 'src/components/ui/minimals/hook-form'

// ----------------------------------------------------------------------

type FormValuesProps = {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: number
  address?: string
  idnp?: string
  userRole?: number
}

export default function RegisterView() {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const returnTo = searchParams.get('returnTo')


  const RegisterSchema = Yup.object().shape({
    email: Yup.string().trim().lowercase().required('E obligatoriu').email('Email invalid'),
    firstName: Yup.string().required('E obligatoriu'),
    lastName: Yup.string().required('E obligatoriu'),
    password: Yup.string().min(6, 'Minim 6 caractere').required('E obligatoriu'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Parolele nu coincid')
      .required('E obligatoriu'),
  phoneNumber: Yup.string().optional(),
  // Accept browser yyyy-MM-dd and convert on submit if needed
  dateOfBirth: Yup.string().optional(),
  // numeric code per backend (e.g., 1 male, 2 female)
  gender: Yup.number().transform((v, o) => (o === '' ? undefined : v)).optional(),
  address: Yup.string().optional(),
  idnp: Yup.string().optional(),
  userRole: Yup.number().transform((v, o) => (o === '' ? undefined : v)).optional(),
  })

  const defaultValues: FormValuesProps = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: undefined,
  address: '',
  idnp: '',
  userRole: undefined,
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  })

  useEffect(() => {
    console.log('dateOfBirth changed:', methods.watch('dateOfBirth'))
  }, [methods.watch('dateOfBirth')])
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        // First, register the user
        const registerResponse = await registerUserRequest({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          idnp: data.idnp,
          userRole: data.userRole,
        })

        if (registerResponse.error) { 
          enqueueSnackbar(registerResponse.message, { variant: 'error' })
          return 
        }

        // After successful registration, request verification code
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
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: -2,
          mt: 4,
        }}
      >
        Înregistrează-te
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Ai deja un cont?</Typography>

        <Link component={RouterLink} href={paths.auth.login} variant="subtitle2">
            Loghează-te
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

      <RHFTextField sx={{height: '40px'}} name="email" label="Email" type="email" inputProps={{ onInput: validateEmailInput, inputMode: 'email', autoComplete: 'email' }} />
      <RHFTextField sx={{height: '40px'}} name="password" label="Password" type="password" />
      <RHFTextField sx={{height: '40px'}} name="confirmPassword" label="Confirm Password" type="password" />
      <RHFTextField sx={{height: '40px'}} name="firstName" label="Name" />
      <RHFTextField sx={{height: '40px'}} name="lastName" label="Surname" />
      <RHFTextField sx={{height: '40px'}} name="phoneNumber" label="Phone Number" type="tel" inputProps={{ onInput: validatePhoneInput, inputMode: 'tel', autoComplete: 'tel' }} />
      <RHFDatePicker name="dateOfBirth" label="Date of Birth" />
      <RHFTextField sx={{height: '40px'}} name="address" label="Address" />
      <RHFTextField sx={{height: '40px'}} name="idnp" label="IDNP" />


    {/* Gender Selection Buttons */}
  <Typography
    variant="caption"
    component="div"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    Gender
  </Typography>
  <Box
    sx={{
      mb: 0,
      mt: -1,
      display: 'flex',
      gap: 1,
    }}
  >
    <LoadingButton
      fullWidth
      color={methods.watch('gender') === 1 ? 'primary' : 'inherit'}
      size="small"
      type="button"
      variant={methods.watch('gender') === 1 ? 'contained' : 'outlined'}
      onClick={() => {
        const currentValue = methods.getValues('gender')
        const newValue = currentValue === 1 ? undefined : 1
        methods.setValue('gender', newValue)
        methods.trigger('gender')
      }}
    >
      Male
    </LoadingButton>

    <LoadingButton
      fullWidth
      color={methods.watch('gender') === 2 ? 'primary' : 'inherit'}
      size="small"
      type="button"
      variant={methods.watch('gender') === 2 ? 'contained' : 'outlined'}
      onClick={() => {
        const currentValue = methods.getValues('gender')
        const newValue = currentValue === 2 ? undefined : 2
        methods.setValue('gender', newValue)
        methods.trigger('gender')
      }}
    >
      Female
    </LoadingButton>
  </Box>


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
            User Role
          </Typography>
          <Box
            sx={{
              mb: 2,
              mt: -1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <LoadingButton
              fullWidth
              color={methods.watch('userRole') === 1 ? 'primary' : 'inherit'}
              size="small"
              type="button"
              variant={methods.watch('userRole') === 1 ? 'contained' : 'outlined'}
              onClick={() => {
                const currentValue = methods.getValues('userRole')
                const newValue = currentValue === 1 ? undefined : 1
                methods.setValue('userRole', newValue)
                methods.trigger('userRole')
              }}
            >
              User
            </LoadingButton>

            <LoadingButton
              fullWidth
              color={methods.watch('userRole') === 2 ? 'primary' : 'inherit'}
              size="small"
              type="button"
              sx={{
                mx: 1,
              }}
              variant={methods.watch('userRole') === 2 ? 'contained' : 'outlined'}
              onClick={() => {
                const currentValue = methods.getValues('userRole')
                const newValue = currentValue === 2 ? undefined : 2
                methods.setValue('userRole', newValue)
                methods.trigger('userRole')
              }}
            >
              Doctor
            </LoadingButton>

            <LoadingButton
              fullWidth
              color={methods.watch('userRole') === 3 ? 'primary' : 'inherit'}
              size="small"
              type="button"
              variant={methods.watch('userRole') === 3 ? 'contained' : 'outlined'}
              onClick={() => {
                const currentValue = methods.getValues('userRole')
                const newValue = currentValue === 3 ? undefined : 3
                methods.setValue('userRole', newValue)
                methods.trigger('userRole')
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
  Înregistrează-te
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

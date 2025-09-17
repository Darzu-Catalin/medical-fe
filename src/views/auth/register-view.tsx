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
          mt: 0,
          color: "white",
        }}
      >
        Registration
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" color = "white">Already have an account?</Typography>

        <Link component={RouterLink} href={paths.auth.login} variant="subtitle2" color="white" sx={{ "&:hover": { color: "#166bd4ff", textDecoration: 'none' } }}>
            Login 
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

  {/* Reusable glass input styling similar to login-view */}
      <RHFTextField
        name="email"
        label="Email"
        type="email"
        inputProps={{ onInput: validateEmailInput, inputMode: 'email', autoComplete: 'email' }}
        sx={(theme) => ({
          height: '40px',
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
        name="password"
        label="Password"
        type="password"
        sx={(theme) => ({
          height: '40px',
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
        label="Confirm Password"
        type="password"
        sx={(theme) => ({
          height: '40px',
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

      <Box sx={{display: 'flex', gap: 1, flexDirection: 'row'}}>
        <RHFTextField
          name="firstName"
          label="Name"
          sx={(theme) => ({
            height: '40px',
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
          name="lastName"
          label="Surname"
          sx={(theme) => ({
            height: '40px',
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
      </Box>
      <Box sx={{display: 'flex', gap: 1, flexDirection: 'row'}}>
        <RHFTextField
          name="phoneNumber"
          label="Phone Number"
          type="tel"
          inputProps={{ onInput: validatePhoneInput, inputMode: 'tel', autoComplete: 'tel' }}
          sx={(theme) => ({
            height: '40px',
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
        <RHFDatePicker
          name="dateOfBirth"
          label="Date of Birth"
          textFieldSx={(theme) => ({
            height: '40px',
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
      </Box>
      <Box sx={{display: 'flex', gap: 1, flexDirection: 'row'}}>
        <RHFTextField
          name="address"
          label="Address"
          sx={(theme) => ({
            height: '40px',
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
          name="idnp"
          label="IDNP"
          sx={(theme) => ({
            height: '40px',
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
      </Box>

    {/* Gender Selection Buttons */}
  <Typography
    variant="caption"
    component="div"
    color={"white"}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    Gender
  </Typography>
  <Box
    sx={{
      mb: -1,
      mt: -2,
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
      Female
    </LoadingButton>
  </Box>


      {window.location.hostname === 'localhost' ? (
        <>
          <Typography
            variant="caption"
            component="div"
            color={"white"}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            User Role
          </Typography>
          <Box
            sx={{
              mb: 1,
              mt: -2,
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
              User
            </LoadingButton>

            <LoadingButton
              fullWidth
              color={methods.watch('userRole') === 2 ? 'primary' : 'inherit'}
              size="small"
              type="button"
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
        sx={{ borderRadius: 2 }}
      >
  Register
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

/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { mutate } from 'swr'
import { object, string } from 'yup'
import { paths } from '@/routes/paths'
import { FormType } from '@/types/types'
import { useForm } from 'react-hook-form'
import Iconify from '@/components/iconify'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { useMemo, useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter, usePathname } from '@/routes/hooks'
import Address from '@/components/custom/address/address'
import { removeUnchangedFields } from '@/utils/forms.utils'
import { upsertPartner } from '@/requests/admin/partner.requests'
import { getCuiInfoRequest } from '@/requests/admin/general.requests'
import SubmitButtonForm from '@/components/custom/forms/submit-button'
import { formGap, formSpacing } from '@/components/custom/forms/constants'
import FormProvider, { RHFTextField } from '@/components/ui/minimals/hook-form'
import TextFieldsContainer from '@/components/custom/forms/text-fields-container'
import { validateNameInput, validateEmailInput, validatePhoneInput } from '@/utils/validationUtils'

import { Box, Grid, Tooltip, Checkbox, FormLabel, Typography } from '@mui/material'

export default function AddEditPartnerModel() {
  const router = useRouter()
  const model = useAppSelector((state) => state.general.selectedPartner)
  const mode: FormType = useMemo(() => (model ? 'edit' : 'new'), [model])
  const [anafDataIsFetching, setAnafDataIsFetching] = useState(false)

  const isClient = usePathname().includes('/client/');

  // Validation for the forms fields
  const modelSchema = object().shape({
    name: string().required('Denumirea societății este obligatorie'),
    register_number: string().required('Numărul de înregistrare este obligatoriu'),
    cif: string().required('CIF-ul este obligatoriu'),
    bank_name: string().required('Numele băncii este obligatoriu'),
    bank_account: string().required('IBAN-ul este obligatoriu'),
    administrator_phone: string().required('Numele administratorului este obligatoriu'),
    administrator_name: string().required('Numele administratorului este obligatoriu'),
    administrator_email: string().required('Email-ul este obligatoriu').email('Email trebuie să fie valid'),
    country_id: string().required('Țara este obligatorie'),
    county_id: string().required('Județul este obligatoriu'),
    city_id: string().required('Orașul este obligatoriu'),
    street: string().required('Strada este obligatorie'),
    street_extra: string().required('Nr. este obligatoriu'),
    tax: string().required('Taxa este obligatorie'),
  })

  // Default values for the forms fields
  const defaultValues = useMemo(
    () => ({
      name: model?.name || '',
      register_number: model?.register_number || '',
      cif: model?.cif || '',
      bank_name: model?.bank_name || '',
      bank_account: model?.bank_account || '',
      administrator_phone: model?.administrator_phone || '',
      administrator_name: model?.administrator_name || '',
      administrator_email: model?.administrator_email || '',
      country_id: model?.country_id || '',
      county_id: model?.county_id || '',
      city_id: model?.city_id || '',
      street: model?.street || '',
      street_extra: model?.street_extra || '',
      tax: model?.tax || 0,
      is_client: model?.is_client || isClient,
      is_provider: model?.is_provider || !isClient,
    }),
    [model]
  )

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(modelSchema),
    defaultValues,
  })

  const {
    reset,
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = methods

  useEffect(() => {
    reset(defaultValues)
  }
    , [defaultValues])

  const values = watch();

  // complete from anaf cui
  const completeFromAnaf = async () => {

    setAnafDataIsFetching(true);
    const response = await getCuiInfoRequest({
      cui: values.cif,
    });
    setAnafDataIsFetching(false);

    if (response.error) {
      enqueueSnackbar(response.message, { variant: 'error' });
      return;
    }

    if (!response.companies || !response.companies.length) {
      return;
    }

    const { companies } = response;

    // first company
    const data = companies[0];


    // set values
    setValue('name', data.date_generale.denumire || '', { shouldDirty: true });
    setValue('register_number', data.date_generale.nrRegCom || '', { shouldDirty: true });
    setValue('cif', data.date_generale.cui, { shouldDirty: true });
    setValue('bank_account', data.date_generale.iban || '', { shouldDirty: true });
    setValue('tax', data.inregistrare_scop_Tva.scpTVA ? 19 : 9, { shouldDirty: true });


    enqueueSnackbar('Datele au fost completate automat', { variant: 'success' });
  };


  const onSubmit = async (dataParam: any) => {

    if (!isDirty) {
      enqueueSnackbar('Nu s-a modificat nimic!', { variant: 'warning' })
      return
    }

    const data = removeUnchangedFields(dataParam, dirtyFields)

    // If we are in edit mode we add the user id to the payload and ignore the password field
    if (mode === 'edit') {
      data.id = model?.id
    }


    data.is_client = isClient;
    data.is_provider = !isClient;

    const response = await upsertPartner(data)

    if (response.error) {
      enqueueSnackbar(response.message, { variant: 'error' })
      return
    }

    // Reset only the fields that were changed in the forms
    reset({ ...dataParam })
    await mutate(`partner-${response.data.id}`)

    enqueueSnackbar(
      mode === 'new' ? 'Datele au fost create ' : 'Datele au fost actualizate',
      {
        variant: 'success',
      }
    )

    if (mode === 'new') {
      router.push(isClient ? paths.dashboard.client.edit(response.data.id) : paths.dashboard.provider.edit(response.data.id))
    }
  }

  return (
    <FormProvider methods={methods}
      onSubmit={handleSubmit(onSubmit)}>
      {/* BIG CONTAINER */}
      <Grid container spacing={formSpacing}>
        {/* LEFT SIDE */}
        {/* RIGHT SIDE */}
        <Grid item xs={12} md={12} gap={formGap}>
          <Grid container spacing={formSpacing}>
            <Grid item xs={12} md={12} gap={formGap}>
              <Typography
                onClick={() => {
                  if (model?.id) {
                    if (model?.is_client) {
                      router.push(paths.dashboard.client.edit(model.id))
                    } else {
                      router.push(paths.dashboard.provider.edit(model.id))
                    }
                  }
                }}
                variant="body1" sx={{ mb: 3, opacity: 0.7 }}>
                Societate {model?.id ? `#${model?.id}` : ''}
              </Typography>
              <TextFieldsContainer>
                <RHFTextField name="name" label="Denumire societate" />
                <RHFTextField name="cif" label="CIF"
                  InputProps={{
                    endAdornment: model ? null : (
                      <Tooltip title="Completează automat">
                        <Box
                          onClick={completeFromAnaf}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            padding: 1,
                            // value ? 'primary.main' : 'text.disabled',
                            bgcolor: values.cif ? 'primary.main' : 'background.neutral',
                          }}
                        >
                          <Iconify
                            onClick={completeFromAnaf}
                            icon={anafDataIsFetching ? "line-md:loading-loop" : "mdi:cloud-sync"}
                            width={18}
                            color={values.cif ? 'white' : 'text.disabled'}
                            height={18}
                          />
                        </Box>
                      </Tooltip>
                    ),
                  }}
                />
                <RHFTextField name="register_number" label="Reg. Com" />
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  cursor: 'pointer',
                  justifyContent: "space-between",
                }}>
                  <Box />
                  <Box>
                    <FormLabel sx={{
                      cursor: 'pointer',
                    }} htmlFor='tax'>Platitor de TVA</FormLabel>
                    <Checkbox
                      name='tax'
                      id="tax"
                      checked={Boolean(values.tax)}
                      onChange={(e, futureValue) => {
                        setValue('tax', futureValue ? 19 : 0, { shouldDirty: true })
                      }}
                    />
                  </Box>
                </Box>
              </TextFieldsContainer>
              <Address
                sx={{
                  mt: 3,
                  mb: 3,
                }}
                city_id={watch('city_id')}
                county_id={watch('county_id')}
                country_id={watch('country_id')}
                street={watch('street')}
                street_extra={watch('street_extra')}
                onChange={(e) => {
                  methods.setValue('city_id', e.city_id, { shouldDirty: true })
                  methods.setValue('county_id', e.county_id, { shouldDirty: true })
                  methods.setValue('country_id', e.country_id, { shouldDirty: true })
                  methods.setValue('street', e.street, { shouldDirty: true })
                  methods.setValue('street_extra', e.street_extra, { shouldDirty: true })
                }}
              />

              <Typography variant="body1" sx={{ mt: 6, mb: 3, opacity: 0.7 }}>
                Administrator
              </Typography>
              <TextFieldsContainer>
                <RHFTextField name="administrator_name" label="Nume" inputProps={{ onInput: validateNameInput }} />
                <RHFTextField name="administrator_email" label="Email" inputProps={{ onInput: validateEmailInput }} />
                <RHFTextField name="administrator_phone" label="Telefon" inputProps={{ onInput: validatePhoneInput }} />
              </TextFieldsContainer>

              <Typography variant="body1" sx={{ mt: 6, mb: 3, opacity: 0.7 }}>
                Bancă
              </Typography>
              <TextFieldsContainer>
                <RHFTextField name="bank_name" label="Nume" />
                <RHFTextField name="bank_account" label="IBAN" />
              </TextFieldsContainer>
              <SubmitButtonForm
                mode={mode}
                isSubmitting={isSubmitting}
                isDisabled={!isDirty}
                newLabel="Creează"
                editLabel="Actualizează"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  )
}

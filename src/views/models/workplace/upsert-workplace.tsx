/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { mutate } from 'swr'
import { object, string } from 'yup'
import { paths } from '@/routes/paths'
import { FormType } from '@/types/types'
import { useForm } from 'react-hook-form'
import { useMemo, useEffect } from 'react'
import { useRouter } from '@/routes/hooks'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { yupResolver } from '@hookform/resolvers/yup'
import Address from '@/components/custom/address/address'
import { removeUnchangedFields } from '@/utils/forms.utils'
import { useGridContext } from '@/components/custom/grid-context'
import FancyCard from '@/components/custom/fancy-card/fancy-card'
import { upsertWorkplace } from '@/requests/admin/workplace.requests'
import SubmitButtonForm from '@/components/custom/forms/submit-button'
import { formGap, formSpacing } from '@/components/custom/forms/constants'
import TextFieldsContainer from '@/components/custom/forms/text-fields-container'
import BusinessHour from '@/components/custom/business-hour/business-hour.component'
import FormProvider, { RHFSwitch, RHFTextField, RHFAutocomplete } from '@/components/ui/minimals/hook-form'

import { Box, Grid } from '@mui/material'

const PACKAGE_OPTIONS = [
    { label: 'Gold', value: 'gold' },
    { label: 'Silver', value: 'silver' },
    { label: 'Bronze', value: 'bronze' },
]

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
]


export default function AddEditWorkplaceModel({
    onSubmitSuccess,
    onSubmitError,
    updater = upsertWorkplace,
}: {
    onSubmitSuccess?: Function
    onSubmitError?: Function
    updater?: Function
}) {
    const router = useRouter()
    const model = useAppSelector((state) => state.general.selectedWorkplace)
    const mode: FormType = useMemo(() => (model ? 'edit' : 'new'), [model])
    const { params, entity } = useGridContext()

    // Validation for the forms fields
    const modelSchema = object().shape({
        name: string().required('Numele este obligatoriu'),
        country_id: string().required('Țara este obligatorie'),
    })

    // Default values for the forms fields
    const defaultValues = useMemo(
        () => ({
            name: model?.name || '',
            services_package: model?.services_package || '',
            tariff_plan: model?.tariff_plan || '',
            notes: model?.notes || '',
            latitude: model?.latitude || 0,
            longitude: model?.longitude || 0,
            business_hours: model?.business_hours || {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: [],
            },
            contact_email: model?.contact_email || '',
            contact_phone: model?.contact_phone || '',
            contact_notes: model?.contact_notes || '',
            contact_url: model?.contact_url || '',
            calendar_appointments_enabled: model?.calendar_appointments_enabled || false,
            ranking: model?.ranking || 0,
            status: model?.status || '',
            partner_id: model?.partner_id || 0,
            main_company_id: model?.main_company_id || 0,
            // address
            country_id: model?.country_id || '',
            county_id: model?.county_id || '',
            city_id: model?.city_id || '',
            street: model?.street || '',
            street_extra: model?.street_extra || '',
        }),
        [model]
    )

    const methods = useForm({
        resolver: yupResolver(modelSchema),
        defaultValues,
    })

    const {
        reset,
        handleSubmit,
        watch, setValue,
        formState: { isSubmitting, isDirty, dirtyFields },
    } = methods

    useEffect(() => {
        reset(defaultValues)
    }
        , [defaultValues])

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

        const response = await updater(data)

        if (response.error) {
            enqueueSnackbar(response.message, { variant: 'error' })
            return
        }

        // Reset only the fields that were changed in the forms
        reset({ ...dataParam })

        await mutate(`${entity}-${JSON.stringify(params)}`)
        enqueueSnackbar(
            mode === 'new' ? 'Datele au fost create ' : 'Datele au fost actualizate',
            {
                variant: 'success',
            }
        )

        if (onSubmitSuccess) {
            // eslint-disable-next-line consistent-return
            return onSubmitSuccess(response.data)
        }

        if (mode === 'new') {
            router.push(paths.dashboard.workplace.edit(response.data.id))
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

                            <FancyCard
                                title='Informații generale'
                                subtitle={`Punctul de lucru ${model?.id ? `#${model?.id}` : ''}`}
                            >
                                <TextFieldsContainer>
                                    <RHFTextField name="name" label="Nume" />

                                    <RHFAutocomplete
                                        name="status"
                                        label="Status"
                                        options={STATUS_OPTIONS}
                                        onChange={(e, newValue) => {
                                            setValue('status' as any, (newValue as any).value || '', { shouldDirty: true })
                                        }}
                                        value={STATUS_OPTIONS.find((option) => option.value === watch('status' as any)) || null}
                                    />

                                    <RHFAutocomplete name="tariff_plan" label="Plan tarifar"
                                        options={PACKAGE_OPTIONS}
                                        onChange={(e, newValue) => {
                                            setValue('tariff_plan' as any, (newValue as any).value || '', { shouldDirty: true })
                                        }}
                                        value={PACKAGE_OPTIONS.find((option) => option.value === watch('tariff_plan' as any)) || null}
                                    />



                                    <RHFTextField name="ranking" label="Rank" />

                                </TextFieldsContainer>
                            </FancyCard>


                            <FancyCard
                                title='Program'
                            >
                                <BusinessHour
                                    editable
                                    timetable={watch('business_hours' as any)}
                                    setTimetable={(e) => setValue('business_hours' as any, e, { shouldDirty: true })}
                                />
                            </FancyCard>


                            <FancyCard title='Despre programări'>
                                <TextFieldsContainer>
                                    <RHFTextField name="contact_phone" label="Telefon" />
                                    <RHFTextField name="contact_url" label="URL" />
                                    <RHFTextField name="contact_email" label="Email" />

                                    <RHFSwitch name="calendar_appointments_enabled" label="Calendar activ"
                                        helperText="Activează sau dezactivează calendarul pentru programări"
                                    />
                                </TextFieldsContainer>

                                <Box sx={{
                                    mt: 2
                                }}>
                                    <RHFTextField
                                        name="contact_notes"
                                        multiline
                                        minRows={4}
                                        label="Notite publice"
                                    />
                                </Box>


                            </FancyCard>


                            <FancyCard title='Adresă'>
                                <Address
                                    sx={{
                                        mt: 3,
                                        mb: 3,
                                    }}
                                    city_id={watch('city_id' as any)}
                                    county_id={watch('county_id' as any)}
                                    country_id={watch('country_id' as any)}
                                    street={watch('street' as any)}
                                    street_extra={watch('street_extra' as any)}
                                    onChange={(e) => {
                                        methods.setValue('city_id' as any, e.city_id, { shouldDirty: true })
                                        methods.setValue('county_id' as any, e.county_id, { shouldDirty: true })
                                        methods.setValue('country_id' as any, e.country_id, { shouldDirty: true })
                                        methods.setValue('street' as any, e.street, { shouldDirty: true })
                                        methods.setValue('street_extra' as any, e.street_extra, { shouldDirty: true })
                                    }}
                                />

                                <TextFieldsContainer>
                                    <RHFTextField name="latitude" label="Latitudine" />
                                    <RHFTextField name="longitude" label="Longitudine" />
                                </TextFieldsContainer>
                            </FancyCard>


                            <FancyCard title='Altele'>
                                <RHFTextField name="notes"
                                    multiline
                                    label="Note" />
                            </FancyCard>

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

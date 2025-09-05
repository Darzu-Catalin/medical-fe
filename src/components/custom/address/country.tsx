import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { CountryType, ApiResponseType } from '@/types/types';
import { getCountries } from '@/requests/admin/general.requests';

import { TextField, Autocomplete } from '@mui/material';

const Country = ({
    country_id,
    onChange,
    sx,
}: {
    country_id: string;
    onChange: (country_id: string) => void;
    sx?: any;
}) => {
    const { data: countries, isLoading: isLoadingCountries } = useSWR<ApiResponseType>('countries', getCountries);
    const t = useTranslations();
    return (
        <Autocomplete
            sx={sx}
            key={`country-${country_id}${isLoadingCountries}`}
            loading={isLoadingCountries}
            options={countries?.data || []}
            getOptionLabel={(option) => option.name}
            value={countries?.data?.find((c: CountryType) => c.id === Number(country_id))}
            onChange={(e, newValue) => onChange(newValue?.id.toString() || '')}
            renderInput={(params) => <TextField {...params} label={t("Address.country")} />}
        />
    );
};

export default Country;

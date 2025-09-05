import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { CityType, ApiResponseType } from '@/types/types';
import { getCities } from '@/requests/admin/general.requests';

import { TextField, Autocomplete } from '@mui/material';

const City = ({
    county_id,
    city_id,
    onChange,
    sx
}: {
    county_id: string;
    city_id: string;
    onChange: (city_id: string) => void;
    sx?: any;
}) => {

    const t = useTranslations();
    const { data: cities, isLoading: isLoadingCities } = useSWR<ApiResponseType>(
        `cities-${county_id}`,
        () => {
            if (!county_id) {
                return Promise.resolve({ data: [], message: 'No county id', error: false }) as Promise<ApiResponseType>;
            }
            return getCities({ county_id: Number(county_id) });
        }
    );

    return (
        <Autocomplete
            sx={sx}
            key={`city-${city_id}${isLoadingCities}-${county_id}`}
            loading={isLoadingCities}
            options={cities?.data || []}
            getOptionLabel={(option) => option.name}
            value={cities?.data?.find((c: CityType) => c.id === Number(city_id))}
            onChange={(e, newValue) => onChange(newValue?.id.toString() || '')}
            renderInput={(params) => <TextField {...params}  label={t("Address.city")} />}
        />
    );
};

export default City;

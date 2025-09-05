import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { CountyType, ApiResponseType } from '@/types/types';
import { getCounties } from '@/requests/admin/general.requests';

import { TextField, Autocomplete, Select, MenuItem, FormLabel, Box } from '@mui/material';

const County = ({
    country_id,
    county_id,
    onChange,
    isSelect = false,
    sx
}: {
    country_id: string;
    county_id: string;
    onChange: (county_id: string) => void;
    sx?: any;
    isSelect?: boolean;
}) => {

    const t = useTranslations();


    const { data: counties, isLoading: isLoadingCounties } = useSWR<ApiResponseType>(
        `counties-${country_id}`,
        () => {
            if (!country_id) {
                return Promise.resolve({ data: [], message: 'No country id', error: false }) as Promise<ApiResponseType>;
            }
            return getCounties({ country_id: Number(country_id) });
        }
    );


    if (isSelect) {
        return <Box sx={sx}>
            <FormLabel>{t("Address.county")}</FormLabel>
            <Select
                key={`county-${country_id}-${county_id}${isLoadingCounties}`}
                value={county_id}
                fullWidth
                onChange={(e) => onChange(e.target.value as any)}
                disabled={isLoadingCounties}
            >
                {counties?.data?.map((c: CountyType) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
        </Box>
    }

    return (
        <Autocomplete
            sx={sx}
            key={`county-${country_id}-${county_id}${isLoadingCounties}`}
            loading={isLoadingCounties}
            options={counties?.data || []}
            getOptionLabel={(option) => option.name}
            value={counties?.data?.find((c: CountyType) => c.id === Number(county_id))}
            onChange={(e, newValue) => onChange(newValue?.id.toString() || '')}
            renderInput={(params) => <TextField {...params} label={t("Address.county")} />}
        />
    );
};

export default County;

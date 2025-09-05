'use client';

import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import useDebouncer from '@/hooks/use-debouncer';
import { decodeAddressRequest } from '@/requests/admin/general.requests';

interface AddressOption {
    place_id: string;
    display_name: string;
    lat: number;
    lng: number;
}

export default function NominaticAddress({
    selectedValue,
    setSelectedValue,
}: {
    selectedValue: AddressOption | null;
    setSelectedValue: (value: AddressOption | null) => void;
}) {
    const [userInput, setUserInput] = useState<string>(selectedValue?.display_name || '');
    const [options, setOptions] = useState<AddressOption[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const debouncedSearchTerm = useDebouncer(userInput, 500);

    const fetchAutocomplete = async (input: string) => {
        setLoading(true); // Start loading
        try {
            const response = await decodeAddressRequest({ q: input });
            setOptions(response as any || []);  // Ensure options are set to an array, even if response is undefined
        } catch (error) {
            setOptions([]); // Clear options if there's an error
        } finally {
            setLoading(false); // End loading
        }
    };

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchAutocomplete(debouncedSearchTerm);
        } else {
            setOptions([]); // Clear options when input is cleared
        }
    }, [debouncedSearchTerm]);

    return (
        <Autocomplete
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={selectedValue}
                onChange={(event, newValue) => {
                    setSelectedValue(newValue);
                    setUserInput(newValue?.display_name || '');
                }}
                noOptionsText="No locations"
                getOptionKey={(option) => option.place_id}
                getOptionLabel={(option) => option.display_name}
                // isOptionEqualToValue={(option, value) => option.place_id === value.place_id}
                loading={loading}  // Add loading state to the Autocomplete
                loadingText="Se încarcă"
                inputMode='search'
                inputValue={userInput}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Address"
                        variant="outlined"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                )}
            />
    );
}

import { Box } from '@mui/material';

import City from './city';
import County from './county';
import Street from './street';
import Country from './country';
import StreetNumber from './street-number';
import TextFieldsContainer from '../forms/text-fields-container';

const Address = ({
  country_id,
  county_id,
  city_id,
  street,
  street_extra,
  onChange,
  sx,
}: {
  country_id: string;
  county_id: string;
  city_id: string;
  street: string;
  street_extra: string;
  onChange: (e: {
    country_id: string;
    county_id: string;
    city_id: string;
    street: string;
    street_extra: string;
  }) => void;
  sx?: any;
}) => {
  const handleCountryChange = (newCountryId: string) => {
    onChange({ country_id: newCountryId, county_id: '', city_id: '', street, street_extra });
  };

  const handleCountyChange = (newCountyId: string) => {
    onChange({ country_id, county_id: newCountyId, city_id: '', street, street_extra });
  };

  const handleCityChange = (newCityId: string) => {
    onChange({ country_id, county_id, city_id: newCityId, street, street_extra });
  };

  const handleStreetChange = (newStreet: string) => {
    onChange({ country_id, county_id, city_id, street: newStreet, street_extra });
  };

  const handleStreetNumberChange = (newStreetNumber: string) => {
    onChange({ country_id, county_id, city_id, street, street_extra: newStreetNumber });
  };

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <TextFieldsContainer>
          <Country country_id={country_id} onChange={handleCountryChange} />
          <County country_id={country_id} county_id={county_id} onChange={handleCountyChange} />
          <City county_id={county_id} city_id={city_id} onChange={handleCityChange} />
          <TextFieldsContainer>
            <Street street={street} onChange={handleStreetChange} />
            <StreetNumber streetNumber={street_extra} onChange={handleStreetNumberChange} />
          </TextFieldsContainer>
        </TextFieldsContainer>
      </Box>
    </Box>
  );
};

export default Address;

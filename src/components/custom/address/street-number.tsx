import { TextField } from '@mui/material';

const StreetNumber = ({
  streetNumber,
  onChange,
}: {
  streetNumber: string;
  onChange: (streetNumber: string) => void;
}) => (
    <TextField
      label="Nr."
      value={streetNumber}
      onChange={(e) => onChange(e.target.value as any)}

    />
  );

export default StreetNumber;

import { TextField } from '@mui/material';

const Street = ({
  street,
  onChange,
}: {
  street: string;
  onChange: (street: string) => void;
}) => (
    <TextField
      label="Stradă"
      value={street}
      onChange={(e) => onChange(e.target.value as any)}

    />
  );

export default Street;

'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from '@/components/ui/minimals/settings';
import MedicalClinicsMap from '@/components/custom/medical-clinics-map/medical-clinics-map';

// ----------------------------------------------------------------------

export default function MedicalClinicsPage() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <MedicalClinicsMap />
    </Container>
  );
}

import { memo } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';


import { bgBlur } from 'src/theme/css';

import { HEADER } from '@/layouts/config-layout';
import { NavSectionHorizontal } from '@/components/ui/minimals/nav-section';
import Scrollbar from '@/components/ui/minimals/scrollbar';
import { useSettingsContext } from '@/components/ui/minimals/settings';
import { Container } from '@mui/material';
import { useNavData } from './config-navigation';


// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const navData = useNavData()
  const settings = useSettingsContext()

  return (
    <AppBar
      component="div"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <Container maxWidth={settings.themeStretch ? 'xl' : 'lg'}>
          <Scrollbar
            sx={{
              '& .simplebar-content': {
                display: 'flex',
                gap: 2,
              },
            }}
          >
            <NavSectionHorizontal
              data={navData}
              sx={{
                ...theme.mixins.toolbar,
              }}
            />
          </Scrollbar>
        </Container>
      </Toolbar>

      {/* <HeaderShadow /> */}
    </AppBar>
  );
}

export default memo(NavHorizontal);

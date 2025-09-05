'use client';

import { m } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { varHover } from '@/components/ui/minimals/animate';
import CustomPopover, { usePopover } from '@/components/ui/minimals/custom-popover';

import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------


const allLangs = [
  {
    value: 'en',
    label: 'English',
    icon: 'twemoji:flag-for-united-kingdom',
  },
  {
    value: "ro",
    label: "Romanian",
    icon: "twemoji:flag-for-romania"
  }

];

export default function LanguagePopover() {
  const popover = usePopover();
  const router = useRouter();
  const locale = useLocale();
  const currentLang = allLangs.find((option) => option.value === locale);
  const pathname = usePathname();
  
  const handleChangeLang = (lang: string) => {
    popover.onClose();

    // check if we have /en or /ro or any other locale in the pathname 
    const pathNameExists = pathname.includes(`/${locale}`);

    // if the pathname includes the locale, we replace it with the new locale
    // else we add the new locale to the pathname
    const newPathname = pathNameExists ? pathname.replace(`/${locale}`, `/${lang}`) : `/${lang}${pathname}`;

    router.replace(newPathname, {
      // @ts-ignore
      locale: lang,
    });

  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          ...(popover.open && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        <Iconify icon={currentLang!.icon} sx={{ borderRadius: 0.65, width: 28 }} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
        {allLangs.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang!.value}
            onClick={() => handleChangeLang(option.value)}
          >
            <Iconify icon={option.icon} sx={{ borderRadius: 0.65, width: 28 }} />

            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

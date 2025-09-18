/* eslint-disable perfectionist/sort-imports */
import 'src/global.css'

// ----------------------------------------------------------------------

import ThemeProvider from 'src/theme'
import { primaryFont } from 'src/theme/typography'

import ProgressBar from 'src/components/ui/minimals/progress-bar'
import { MotionLazy } from '@/components/ui/minimals/animate/motion-lazy'
import { SettingsProvider } from 'src/components/ui/minimals/settings'

import SnackbarProvider from '@/components/ui/minimals/snackbar/snackbar-provider'
import ReduxProvider from '@/redux/redux-provider'
import { AppFirstLogic } from '@/auth/context/app-first-logic'
import { Viewport } from 'next'
import { useMessages, NextIntlClientProvider } from 'next-intl'
import MuiXLicense from '@/components/custom/mui-license/MuiLicense'
import { headers } from 'next/headers'

// ----------------------------------------------------------------------
export const dynamic = "force-dynamic"

export async function generateMetadata({ params: { locale } }: {
  params: { locale: string }
}) {

  const myHeaders = headers()


  const host = myHeaders.get('host')

  let title = 'The Good place'
  if(host?.includes('autonom')){
    title = 'Autonom'
  } 

  if(host?.includes('localhost')){
    title = 'Localhost'
  }

  return {
    title,
    description:
      'Fleet management system for car rental companies, car dealerships, and car service centers.',
    keywords: 'react,material,kit,application,dashboard,admin,template',
    manifest: '/manifest.json',
  }
}

// export const metadata = {
//   title: 'Carcentric',
//   description:
//     'Fleet management system for car rental companies, car dealerships, and car service centers.',
//   keywords: 'react,material,kit,application,dashboard,admin,template',
//   manifest: '/manifest.json',
//   icons: [{ rel: 'icon', url: '/favicon/carcentric_logo.png' }],
// }

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

type Props = {
  children: React.ReactNode
  params: {
    locale: string
  }
}

export default function RootLayout({ children, params: { locale } }: Props) {
  const messages = useMessages();

  return (
    <html lang={locale} className={primaryFont.className}>
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <ReduxProvider>
            <AppFirstLogic>
              <SettingsProvider
                defaultSettings={{
                  themeMode: 'dark',
                  themeLayout: 'vertical',
                  themeStretch: true,
                }}
              >
                <ThemeProvider>
                  <MotionLazy>
                    <SnackbarProvider>
                      <ProgressBar />
                      {children}
                    </SnackbarProvider>
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </AppFirstLogic>
          </ReduxProvider>
        </NextIntlClientProvider>
        <MuiXLicense />
      </body>
    </html>
  )
}

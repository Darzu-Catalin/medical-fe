// ----------------------------------------------------------------------

export type SettingsValueProps = {
  themeMode: 'light' | 'dark'
  themeLayout: 'vertical' | 'mini' | 'horizontal'
  themeStretch: boolean
}

export type SettingsContextProps = SettingsValueProps & {
  // Update
  onUpdate: (name: string, value: string | boolean) => void
}

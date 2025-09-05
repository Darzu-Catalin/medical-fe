import { ReactNode } from 'react'
import DefaultPanel from '@/components/custom/forms/default-panel'
import TextFieldsContainer from '@/components/custom/forms/text-fields-container'

export default function DetailsPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DefaultPanel title={title} tooltipTitle="Disponibile doar pentru vizualizare">
      <TextFieldsContainer>{children}</TextFieldsContainer>
    </DefaultPanel>
  )
}

import { clone } from 'lodash'

export const removeUnchangedFields = (originalData: any, dirtyFields: any) => {
  // Copy the original data to avoid mutating it
  const copiedOriginalData = clone(originalData)

  // Use dirtyFields to identify which fields were changed
  const changedFields = Object.keys(dirtyFields)

  // Delete the unchanged fields from data
  Object.keys(copiedOriginalData).forEach((field: string) => {
    if (!changedFields.includes(field)) {
      delete copiedOriginalData[field]
    }
  })

  return copiedOriginalData
}

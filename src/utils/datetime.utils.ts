type InputValue = Date | string | number | null | undefined

export function newDate(date: InputValue): Date | null {
  if (!date) return null
  return new Date(date)
}

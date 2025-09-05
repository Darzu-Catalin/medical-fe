export const processNewDate = (oldDates: Date[], newDate: Date | null): Date[] => {
  if (!newDate) {
    return oldDates;
  }

  const newDates = [...oldDates]

  const sameDayDate = oldDates.findIndex(date => (
    date.getDay() === newDate.getDay() &&
    date.getMonth() === newDate.getMonth() &&
    date.getFullYear() === newDate.getFullYear()
  ));
  if (sameDayDate !== -1) {
    newDates[sameDayDate] = newDate
  } else {
    newDates.push(newDate)
    newDates.sort((a, b) => a.getTime() - b.getTime())
  }

  return newDates
}

export const onRemoveDate = (oldDates: Date[], indexToRemove: number): Date[] => {
  if (indexToRemove >= oldDates.length || indexToRemove < 0) {
    return oldDates;
  }

  const newDates = oldDates.filter((_, index) => index !== indexToRemove)

  return newDates
}
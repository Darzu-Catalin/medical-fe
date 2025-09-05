import { useRef, useEffect, useLayoutEffect } from 'react'

function useInterval({
  callback,
  minutes,
  runOnMount = false,
}: {
  callback: () => void
  minutes: number
  runOnMount?: boolean
}) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback])

  useEffect(() => {
    if (runOnMount) {
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!minutes && minutes !== 0) {
      return
    }

    const id = setInterval(() => savedCallback.current(), minutes * 60 * 1000)

    // eslint-disable-next-line
    return () => clearInterval(id)
  }, [minutes])
}

export default useInterval

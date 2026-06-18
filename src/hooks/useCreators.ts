import { useEffect, useState } from 'react'
import { getAllCreators } from '../services/creatorService'
import type { CreatorRow } from '../types/database'

interface State {
  creators: CreatorRow[]
  loading: boolean
  error: string | null
}

export function useCreators() {
  const [state, setState] = useState<State>({ creators: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false

    getAllCreators()
      .then((creators) => {
        if (!cancelled) setState({ creators, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ creators: [], loading: false, error: (err as Error).message })
      })

    return () => { cancelled = true }
  }, [])

  return state
}

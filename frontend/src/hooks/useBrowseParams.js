import { useSearchParams } from "react-router-dom"
import { Sort } from "@/api/types"

const DEFAULTS = { q: "", status: "", sort: Sort.SUPPORT }

export function useBrowseParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = {
    q: searchParams.get("q") ?? DEFAULTS.q,
    status: searchParams.get("status") ?? DEFAULTS.status,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
  }

  const setParams = (patch) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: false })
  }

  const clear = () => setSearchParams(new URLSearchParams())

  return { params, setParams, clear }
}
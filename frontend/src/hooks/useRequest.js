import { useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useRequest(id) {
  return useQuery({
    queryKey: ["request", id],
    queryFn: () => api.getRequest(id),
    enabled: Boolean(id),
  })
}
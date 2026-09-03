import { useQuery } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useRequests(params) {
  return useQuery({
    queryKey: ["requests", params],
    queryFn: () => api.listRequests(params),
  })
}
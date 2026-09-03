import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useMerge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ absorbedId, into }) => api.mergeRequests(absorbedId, { into }),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })
}
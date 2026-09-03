import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useStatusChange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.setStatus(id, { status }),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
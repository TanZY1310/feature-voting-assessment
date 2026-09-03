import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useUpdateRequest(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api.updateRequest(id, input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })
}
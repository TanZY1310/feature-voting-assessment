import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useDeleteRequest(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.deleteRequest(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
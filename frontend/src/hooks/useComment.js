import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useComment(requestId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.addComment(requestId, { body }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["request", requestId] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })
}
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api.createRequest(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
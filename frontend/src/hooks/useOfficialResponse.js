import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useOfficialResponse(requestId) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["request", requestId] })

  const setResponse = useMutation({
    mutationFn: (body) => api.setOfficialResponse(requestId, { body }),
    onSettled: invalidate,
  })
  const removeResponse = useMutation({
    mutationFn: () => api.removeOfficialResponse(requestId),
    onSettled: invalidate,
  })

  return { setResponse, removeResponse }
}
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

// Optimistic vote set/clear with rollback on error.
export function useVote() {
  const queryClient = useQueryClient()

  const applyOptimistic = (requestId, delta, voted) => {
    queryClient.setQueriesData({ queryKey: ["request", requestId] }, (old) => {
      if (!old) return old
      return { ...old, support: Math.max(0, old.support + delta), votedByMe: voted }
    })
    queryClient.setQueriesData({ queryKey: ["requests"] }, (old) => {
      if (!old) return old
      return {
        ...old,
        items: old.items.map((r) =>
          r.id === requestId
            ? { ...r, support: Math.max(0, r.support + delta), votedByMe: voted }
            : r
        ),
      }
    })
  }

  const mutation = useMutation({
    mutationFn: ({ requestId, action }) =>
      action === "set" ? api.setVote(requestId) : api.clearVote(requestId),
    onMutate: async ({ requestId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["request", requestId] })
      await queryClient.cancelQueries({ queryKey: ["requests"] })
      const previousRequest = queryClient.getQueryData(["request", requestId])
      const previousList = queryClient.getQueryData(["requests"])
      applyOptimistic(requestId, action === "set" ? 1 : -1, action === "set")
      return { previousRequest, previousList }
    },
    onError: (error, { requestId }, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(["request", requestId], context.previousRequest)
      }
      if (context?.previousList) {
        queryClient.setQueryData(["requests"], context.previousList)
      }
    },
    onSettled: (_data, _error, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ["request", requestId] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })

  return {
    vote: (requestId) => mutation.mutate({ requestId, action: "set" }),
    unvote: (requestId) => mutation.mutate({ requestId, action: "clear" }),
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
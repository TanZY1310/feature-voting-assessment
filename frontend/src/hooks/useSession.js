import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"

export function useSession() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ["session"],
    queryFn: () => api.getSession(),
  })

  const switchRole = useMutation({
    mutationFn: (role) => api.setSession(role),
    onSettled: () => {
      // Same path a real sign-in would use: full refetch.
      queryClient.invalidateQueries()
    },
  })

  return { user: query.data ?? null, ...query, switchRole }
}
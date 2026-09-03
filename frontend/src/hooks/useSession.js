import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api/client"
import { getToken } from "@/api/token"

export function useSession() {
  const queryClient = useQueryClient()
  const token = getToken()

  const query = useQuery({
    queryKey: ["session", token],
    queryFn: () => api.getSession(),
  })

  const login = useMutation({
    mutationFn: ({ email, password }) => api.login(email, password),
    onSettled: () => {
      // Same path a real sign-in uses: full cache refresh.
      queryClient.invalidateQueries()
    },
  })

  const logout = useMutation({
    mutationFn: () => api.logout(),
    onSettled: () => {
      queryClient.clear()
    },
  })

  return { user: query.data ?? null, ...query, login, logout }
}
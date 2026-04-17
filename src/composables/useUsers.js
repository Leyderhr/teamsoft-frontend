import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'
import {
  fetchGetUsers,
  fetchGetUserById,
  fetchCreateUser,
  fetchUpdateUser,
  fetchDeleteUser,
  fetchResetPassword
} from '@/services/users'

/**
 * Composable para gestión de usuarios
 */
export function useUsers() {
  // Query: Obtener todos los usuarios
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchGetUsers
  })

  // Mutation: Crear usuario
  const createUserMutation = useMutation({
    mutationFn: fetchCreateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // Mutation: Actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => fetchUpdateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // Mutation: Eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: fetchDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // Mutation: Resetear contraseña
  const resetPasswordMutation = useMutation({
    mutationFn: fetchResetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return {
    // Data
    users,
    isLoadingUsers,
    usersError,
    refetchUsers,

    // Mutations
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    createUserError: createUserMutation.error,

    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
    updateUserError: updateUserMutation.error,

    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
    deleteUserError: deleteUserMutation.error,

    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error
  }
}

/**
 * Composable para obtener un usuario por ID
 * @param {import('vue').Ref<number>} userId
 */
export function useUser(userId) {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError
  } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchGetUserById(userId.value),
    enabled: () => !!userId.value
  })

  return {
    user,
    isLoadingUser,
    userError
  }
}

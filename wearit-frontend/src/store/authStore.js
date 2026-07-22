import { create } from 'zustand'
import { getToken, setToken, removeToken, decodeToken } from '../utils/helpers'

const useAuthStore = create((set) => ({
  token: getToken(),
  user: getToken() ? decodeToken(getToken()) : null,

  login: (token) => {
    setToken(token)
    set({ token, user: decodeToken(token) })
  },

  logout: () => {
    removeToken()
    set({ token: null, user: null })
  },

  isAdmin: () => {
    const state = useAuthStore.getState()
    return state.user?.role === 'admin'
  },
}))

export default useAuthStore

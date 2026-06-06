import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user') || 'null')
    )

    const loginUser = (data) => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
        setToken(data.token)
        setUser({ name: data.name, email: data.email })
    }

    const logoutUser = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
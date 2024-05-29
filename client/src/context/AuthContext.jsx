import { createContext, useContext, useState, useEffect } from "react";
import { registerRequest, loginRequest, verityTokenRequest } from "../api/auth";
import Cookies from "js-cookie";


export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAutheticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            console.log(res.data);
            setUser(res.data);
            setIsAutheticated(true);
        } catch (error) {
            //console.log(error.response)
            setErrors(error.response.data);
        }
    }

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            console.log(res)
            setIsAutheticated(true);
            setUser(res.data)
        } catch (error) {
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data)
            }
            setErrors([error.response.data.message])
        }
    }

    const logout = () =>{
        Cookies.remove("token");
        setIsAutheticated(false);
        setUser(null);
    }

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [errors]);

    useEffect(() => {
        async function checkLogin() {
            const cookies = Cookies.get();

            if (!cookies.token) {
                setIsAutheticated(false);
                setLoading(false);
                return setUser(null);
            }

            try {
                const res = await verityTokenRequest(cookies.token);
                if (!res.data) {
                    setIsAutheticated(false);
                    setLoading(false);
                    return;
                }
                setIsAutheticated(true)
                setUser(res.data)
                setLoading(false);
            } catch (error) {
                console.log(error);
                setIsAutheticated(false)
                setUser(null)
                setLoading(false);
            }
        }
    checkLogin()
    }, []);

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            logout,
            loading,
            user,
            isAuthenticated,
            errors
        }}>
            {children}
        </AuthContext.Provider>
    )
}
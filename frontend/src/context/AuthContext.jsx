import { createContext, useContext } from "react";
import { useAuthState } from "./authContext.functions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

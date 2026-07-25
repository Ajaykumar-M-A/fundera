import { useEffect, useState } from "react";
import { clearToken, fetchMe, getToken, setRefreshToken, setToken, loginApi } from "../api/client";
import { register as registerApi } from "../api/trading";

export function useAuthState() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const me = await fetchMe();
    setUser({ ...me, loggedIn: true });
    return me;
  };

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    refresh()
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (!getToken()) return;
      refresh().catch(() => {});
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const login = async (email, password) => {
    const { access_token, refresh_token } = await loginApi(email, password);
    setToken(access_token);
    setRefreshToken(refresh_token);
    try {
      const me = await fetchMe();
      setUser({ ...me, loggedIn: true });
      return me;
    } catch (err) {
      clearToken();
      throw new Error(
        err.message === "Not Found"
          ? "Login succeeded, but the frontend is connected to an older backend. Restart the updated backend or set VITE_API_PROXY_TARGET."
          : err.message
      );
    }
  };

  const register = async (data) => {
    await registerApi(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return { user, loading, login, register, logout, refresh };
}

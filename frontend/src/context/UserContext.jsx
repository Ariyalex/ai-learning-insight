import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user kalau token ada
  const loadUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const res = await api.get("/users/me");
      setUser(res.data.data);
    } catch (err) {
      console.log("Gagal load user:", err);
      localStorage.clear();
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

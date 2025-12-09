import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const MLContext = createContext(null);

export function MLProvider({ children }) {
  const [predict, setPredict] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(true);

  // Fetch user kalau token ada
  const loadPredict = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoadingPredict(false);
      return;
    }

    try {
      const res = await api.get("/insight");
      setPredict(res.data.data);
    } catch (err) {
      console.log("Gagal load predict:", err);
    } finally {
      setLoadingPredict(false);
    }
  };

  useEffect(() => {
    loadPredict();
  }, []);

  return (
    <MLContext.Provider value={{ predict, setPredict, loadingPredict,loadPredict }}>
      {children}
    </MLContext.Provider>
  );
}

export default MLProvider;
import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Skeleton from "@/components/ui/Skeleton";

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, loadingUser } = useContext(UserContext);

  // Delay 2 detik
  const [delayDone, setDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDelayDone(true), 1500); // 2 detik
    return () => clearTimeout(timer);
  }, []);

  if (loadingUser || !delayDone) {
    if (location.pathname === "/") {
      return (
        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="md:col-span-3 p-4 border rounded-lg bg-white">
            <Skeleton className="h-12 w-full" />
          </div>

          {[1,2,3].map((i) => (
            <div key={i} className="p-4 border rounded-lg bg-white">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
          
          <div className="md:col-span-3 p-4 border rounded-lg bg-white">
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      );
    } else if (location.pathname === "/profile") {
      return (
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Skeleton className="h-9 w-65 mb-2" />
          <Skeleton className="w-36 h-36 rounded-full mb-6" />
          <Skeleton className="h-8 w-65 mb-2" />
          <Skeleton className="h-8 w-65" />
        </div>
      );
    } else if (location.pathname === "/history") {
      return (
        <div className="grid gap-6 md:grid-cols-3 mr-52 ml-52">
          <div className="md:col-span-3 p-4 border rounded-lg bg-white">
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="md:col-span-3 p-4 border rounded-lg bg-white">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      );
    }
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

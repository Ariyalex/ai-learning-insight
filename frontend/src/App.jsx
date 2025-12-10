import { useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import HistoryPage from "./pages/History"
import Login from "./pages/Login"
import { Button } from "@/components/ui/button"
import logo_full from "./assets/logo_full.png"
import { User, House, ChevronUp } from "lucide-react"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"
import api from "./services/api";
import { UserContext } from "./context/UserContext";
import { Toaster } from "@/components/ui/toaster"
import { toast } from "./hooks/use-toast"


function Layout() {
  const location = useLocation()
  const navigated = useNavigate()
  
  const { user } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        toast({
          title: "📢 Berhasil Logout!",
          description: "Anda telah logout, redirecting...",
        })
        localStorage.clear();
        navigated("/login");
        return;
      }

      await api.post("/auth/logout", { refreshToken });

      toast({
        title: "📢 Berhasil Logout!",
        description: "Anda telah logout, redirecting...",
      })

      localStorage.clear();
      navigated("/login");

    } catch (err) {
      console.log("Logout error:", err);
      localStorage.clear();
      navigated("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header hanya tampil kalau bukan di halaman login */}
      {location.pathname !== "/login" && (
        <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white relative">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={logo_full}
              className="hidden md:block h-8 w-auto object-contain"
              alt="AI Learning Insight"
            />
            <img
              src="/logo_cut.png"
              className="block md:hidden h-8 w-auto object-contain rounded-full"
              alt="AI Learning Insight"
            />
          </div>

          {/* Navbar */}
          <nav className="flex gap-4 items-center">
            <Link to="/">
              <Button variant="outline" className="p-4">
                <House className="w-5 h-5" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            {/* Hover dropdown lebih stabil */}
            <div className="relative group">
              <Button className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2 rounded-lg p-4">
                <User className="w-5 h-5" />
                <span className="hidden md:inline pr-1">{user?.name || "Loading..."}</span>
                <ChevronUp className="w-5 h-5" />
              </Button>

              {/* invisible bridge area */}
              <div className="absolute top-full left-0 w-full h-3 bg-transparent"></div>

              {/* dropdown menu */}
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 
                              opacity-0 scale-95 translate-y-1 pointer-events-none 
                              group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 
                              group-hover:pointer-events-auto transition-all duration-200 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Profil Saya
                </Link>
                <Link
                  to="/history"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  History Insight
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* Konten Halaman */}
      <main className="flex-1 p-6">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="text-center py-3 text-sm text-gray-400 bg-white shadow-inner">
        © 2025 AI Learning Insight Indonesia
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Toaster />
      <Layout />
    </Router>
  )
}

export default App

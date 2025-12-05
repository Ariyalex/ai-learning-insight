import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import logo_full from "../assets/logo_full.png"
import { MousePointer2 } from "lucide-react"
import { UserContext } from "../context/UserContext"
import { MLContext } from "../context/MLContext";
import { toast } from "../hooks/use-toast"

function Login() {
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext);
  const { setPredict, loadPredict } = useContext(MLContext);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password });

      console.log("RESPONSE DARI BACKEND:", res.data)
      console.log("accessToken:", res.data.data.accessToken)
      console.log("refreshToken:", res.data.data.refreshToken)

      // Simpan token ke localStorage
      localStorage.setItem("accessToken", res.data.data.accessToken)
      localStorage.setItem("refreshToken", res.data.data.refreshToken)

      // Fetch user info
      const res_user = await api.get("/users/me");
      setUser(res_user.data.data); // masukin ke context biar global

      // ambil insight
      try {
        await api.get("/insight")
      } catch (err) {
        if (err?.response?.status === 404) {
          toast({
            title: "⏳ Tunggu sebentar!",
            description: "Sistem sedang menyiapkan insight perdana kamu...",
          });
          await api.get("/insight/process") // Generate kalau belum ada
        }
      }
      // Update insight ke global context
      await loadPredict()

      toast({
        title: "📢 Berhasil Login!",
        description: "Anda telah login, redirecting...",
      })

      // Redirect ke dashboard
      navigate("/")
    } catch (err) {

      console.log("ERROR RESPONSE:", err.response)

      toast({
        title: "📢 Peringatan!",
        description: err.response?.data?.message ||  "Gagal login, coba lagi.",
      })

    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={logo_full}
          alt="AI Learning Insight"
          className="h-20 w-auto object-contain mb-3"
        />
        <p className="text-gray-500 text-sm">Akademik Program Dashboard</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-md border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Selamat datang
          </CardTitle>
          <p className="text-sm text-gray-500">
            Masuk dengan email yang sudah dibuat!
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-300 focus-visible:ring-[#2d3e50]"
            />

            <Input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-300 focus-visible:ring-[#2d3e50]"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2d3e50] hover:bg-[#243341] text-white flex items-center justify-center"
            >
              {loading ? "Loading..." : "Login"}
              <MousePointer2 className="w-5 h-5 ml-1" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

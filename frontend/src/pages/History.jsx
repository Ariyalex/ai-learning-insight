import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { History, Clock } from "lucide-react"
import { toast } from "../hooks/use-toast"
import Skeleton from "@/components/ui/Skeleton";

function HistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadHistory = async () => {
    try {
      const res = await api.get("/insight/logs")
      setItems(res.data.data || [])
    } catch (err) {
      toast({
        title: "Gagal memuat riwayat",
        description: err.response?.data?.message || "Coba lagi nanti",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 mr-52 ml-52">
        <div className="md:col-span-3 p-4 border rounded-lg bg-white">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="md:col-span-3 p-4 border rounded-lg bg-white">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <Card className="p-1">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <History className="w-6 h-6 text-gray-500" />
          <CardTitle>Riwayat Pembaruan Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Semua update insight kamu muncul di sini biar gampang nge-track perkembangan kamu
          </p>
        </CardContent>
      </Card>

      {/* KETIKA DATA KOSONG */}
      {items.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          Belum ada riwayat insight. Yuk refresh insight dulu ✨
        </div>
      )}

      {/* LIST HISTORY */}
      {items.map((item) => (
        <Card 
          key={item.id}
          onClick={() => navigate(`/`, { state: { insightId: item.id } })}
          className="border shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="py-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold capitalize">
                {item.cluster_label}
              </h3>

              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleString("id-ID", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed">
              <p>
                <b>Aktivitas:</b> {item.activity_insight}
              </p>
              <p>
                <b>Akademik:</b> {item.academic_insight}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default HistoryPage

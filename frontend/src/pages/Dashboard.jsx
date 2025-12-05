import { useState, useEffect, useContext } from "react"
import { useLocation } from "react-router-dom"
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookText, Bell, Trophy, RefreshCcw, Loader2, Clock } from "lucide-react"
import { MLContext } from "../context/MLContext"
import { toast } from "../hooks/use-toast"
import TrackingChart from "../components/TrackingChart";

function Dashboard() {
  const { predict, setPredict, loadingPredict, loadPredict } = useContext(MLContext);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const selectedInsightId = location.state?.insightId || null;
  const [overridePredict, setOverridePredict] = useState(null);
  const data = overridePredict || predict;
  useEffect(() => {
    if (!selectedInsightId) return;

    const loadOldInsight = async () => {
      try {
        const res = await api.get(`/insight/${selectedInsightId}`);
        setOverridePredict(res.data.data);
      } catch (err) {
        toast({
          title: "Gagal memuat insight sebelumnya",
          description: err.response?.data?.message || "Coba lagi nanti.",
        });
      }
    };

    loadOldInsight();
  }, [selectedInsightId]);

  const fetchInsight = async () => {
    try {
      setLoading(true);
      
      // proses prediksi di backend
      await api.get("/insight/process");

      // reload data insight dari database via context
      await loadPredict();

      // Reset override, biar balik ke insight terbaru
      setOverridePredict(null)
      
      toast({
        title: "📢 Berhasil Update Insight!",
        description: "Insight kamu udah di-refresh ke versi terbaru.",
      });
    } catch (err) {
      toast({
        title: "📢 Peringatan!",
        description: err.response?.data?.message ||  "Gagal update, coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPredict) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UPDATE INSIGHT SECTION */}
      <div className="p-5 bg-white rounded-lg shadow flex flex-col md:flex-row md:justify-between md:items-center gap-3 border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Insight Pembelajaran Kamu</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              {new Date(data.created_at).toLocaleString("id-ID", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              </p>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Insight ini menggambarkan pola belajar kamu. Jika kamu merasa ada peningkatan,
            klik refresh agar sistem menghitung ulang berdasarkan data terbaru
          </p>
        </div>
        <Button onClick={fetchInsight} disabled={loading} className="bg-primary text-white flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4" />
              Refresh Insight
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <Card>
          <CardHeader>
            <BookText className="w-6 h-6 text-gray-400 mb-2" />
            <CardTitle>Aktifitas & Konsistensi Belajar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data?.activity_insight  || "Loading..."}</p>
            <p className="text-sm text-gray-500">{data?.activity_insight_k || "Loading..."}</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card>
          <CardHeader>
            <Bell className="w-6 h-6 text-gray-400 mb-2" /> 
            <CardTitle>Tipe Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data?.cluster_label  || "Loading..."}</p>
            <p className="text-sm text-gray-500">{data?.cluster_label_k || "Loading..."}</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card>
          <CardHeader>
            <Trophy className="w-6 h-6 text-gray-400 mb-2" /> 
            <CardTitle>Kinerja Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data?.academic_insight  || "Loading..."}</p>
            <p className="text-sm text-gray-500">{data?.academic_insight_k || "Loading..."}</p>
          </CardContent>
        </Card>

        {/* ctivity Chart */}
        <TrackingChart />
      </div>
    </div>
  )
}

export default Dashboard

import { useEffect, useState } from "react";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-md shadow border text-sm">
      <p className="font-medium">
        {item.start} - {item.end}
      </p>
      <p className="text-blue-600 font-semibold">Total: {item.total}</p>
    </div>
  );
};

function TrackingChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
      const res = await api.get("/tracking/chart");
      let raw = res.data.data || [];

      // Urutkan berdasarkan tanggal
      raw.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      // Format & map
      // const formatted = raw.map((item) => ({
      //   date: new Date(item.start_date).toLocaleDateString("id-ID", {
      //     day: "2-digit",
      //     month: "short",
      //   }),
      //   total: item.total,
      // }))

      const formatted = raw.map((item) => ({
        // date: new Date(item.start_date).toLocaleDateString("id-ID", {
        //   day: "2-digit",
        //   month: "short",
        // }),
        date: new Date(item.start_date).toLocaleDateString("id-ID", {
          month: "short",
        }),
        start: new Date(item.start_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        end: new Date(item.end_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        total: item.total,
      }));

      setData(formatted);
    } catch (err) {
      toast({
        title: "Gagal memuat grafik",
        description: err.response?.data?.message || "Coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  if (loading) {
    return (
      <Card className="md:col-span-3 p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </Card>
    );
  }

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Tren Aktivitas Belajar per Minggu</CardTitle>
        <p className="text-sm text-gray-500">
          Grafik ini menunjukkan total aktivitas kamu setiap minggu, diurutkan
          berdasarkan waktu
        </p>
      </CardHeader>

      <CardContent>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrackingChart;

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import StatCard from "../components/statcard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setToday(dateStr);
  }, []);

  const getToken = () => localStorage.getItem("token");

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) {
        router.push("/auth/login");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4000/orders", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/auth/login");
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        setData(result.orders || []);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch orders:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Prepare chart data
  useEffect(() => {
    if (data.length === 0) return;

    const categorySales = data.reduce((acc, order) => {
      order.items.forEach((item) => {
        const category = item.menu_category;
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        acc[category] = (acc[category] || 0) + price * quantity;
      });
      return acc;
    }, {});

    const labels = Object.keys(categorySales);
    const salesData = labels.map((category) => categorySales[category]);

    setChartData({
      labels,
      datasets: [
        {
          label: "Total Sales",
          data: salesData,
          backgroundColor: ["#0E43AF", "#3572EF", "#C2D4FA"],
          fill: true,
        },
      ],
    });
  }, [data]);

  // Open stat per category
  const openStatDetail = async (category) => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setSelectedStat({ title: category, details: [] });
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:4000/orders/${category}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setSelectedStat({ title: category, details: result.details || [] });
    } catch (e) {
      setError(e);
      console.error(`Gagal fetch detail ${category}:`, e);
      setSelectedStat({ title: category, details: [] });
    } finally {
      setLoading(false);
    }
  };

  const closeStatDetail = () => setSelectedStat(null);

  // Stats calculation
  const totalOrders = data.length;
  const totalOmzet = data.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const allMenuOrders = data.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.quantity || 0), 0), 0);
  const totalFoodOrders = data.reduce((sum, o) => sum + o.items.filter((i) => i.menu_category === "food").reduce((s, i) => s + (i.quantity || 0), 0), 0);
  const totalBeverageOrders = data.reduce((sum, o) => sum + o.items.filter((i) => i.menu_category === "beverage").reduce((s, i) => s + (i.quantity || 0), 0), 0);
  const totalDessertOrders = data.reduce((sum, o) => sum + o.items.filter((i) => i.menu_category === "dessert").reduce((s, i) => s + (i.quantity || 0), 0), 0);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-medium">Dashboard</h4>
        <p className="text-sm text-[var(--neutral-grey7)]">{today}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Orders" value={totalOrders} iconSrc="/assets/icons/receipt.svg" />
        <StatCard title="Total Omzet" value={totalOmzet} iconSrc="/assets/icons/wallet-money.svg" />
        <StatCard title="All Menu Orders" value={allMenuOrders} iconSrc="/assets/icons/document.svg" />
        <StatCard title="Foods" value={totalFoodOrders} iconSrc="/assets/icons/reserve.svg" detailOnClick={() => openStatDetail("food")} />
        <StatCard title="Beverages" value={totalBeverageOrders} iconSrc="/assets/icons/coffee.svg" detailOnClick={() => openStatDetail("beverage")} />
        <StatCard title="Desserts" value={totalDessertOrders} iconSrc="/assets/icons/cake.svg" detailOnClick={() => openStatDetail("dessert")} />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Total Omzet</h4>
        </div>
        <Bar data={chartData} />
      </div>

      {/* Modal */}
      {selectedStat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            <button onClick={closeStatDetail} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            <h4 className="text-2xl font-medium">{selectedStat.title}</h4>
            {selectedStat.details.length > 0 ? (
              <table className="w-full text-sm mt-2">
                <thead className="bg-gray-100">
                  <tr className="text-left font-medium">
                    <th className="p-3">Menu Name</th>
                    <th className="p-3">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStat.details.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">Tidak ada data yang tersedia.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
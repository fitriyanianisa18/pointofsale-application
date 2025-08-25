"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Bar } from "react-chartjs-2";
import StatCard from "@/app/components/statcard";
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

//  ChartJS components
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
  const [data, setData] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(false); // default false
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

  // bar chart data
  useEffect(() => {
    if (data.length > 0) {
      const categorySales = data.reduce((acc, order) => {
        order.items.forEach((item) => {
          const category = item.menu_category;
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          if (
            category === "food" ||
            category === "beverage" ||
            category === "dessert"
          ) {
            acc[category] = (acc[category] || 0) + price * quantity;
          }
        });
        return acc;
      }, {});

      const labels = Object.keys(categorySales);
      const salesData = labels.map((category) => categorySales[category] || 0);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Total Sales",
            data: salesData,
            backgroundColor: ["#0E43AF", "#3572EF", "#C2D4FA"],
            fill: true,
          },
        ],
      });
    }
  }, [data]);

  // 🔥 Bagian fetch API
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:4000/orders");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        setData(responseData.orders);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stat card click handler
  const openStatDetail = async (category) => {
    setSelectedStat({ title: category, details: [] });
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/orders/${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      setSelectedStat({ title: category, details: responseData.details });
    } catch (e) {
      setError(e);
      console.error(`Gagal mengambil detail statistik untuk ${category}:`, e);
      setSelectedStat({ title: category, details: [] });
    } finally {
      setLoading(false);
    }
  };

  const closeStatDetail = () => {
    setSelectedStat(null);
  };

  // Calculate stats
  const totalOrders = data.length;

  const totalOmzet = data.reduce(
    (sum, order) => sum + (parseFloat(order.total) || 0),
    0
  );

  const allMenuOrders = data.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  const totalFoodOrders = data.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => item.menu_category === "food")
        .reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  const totalBeverageOrders = data.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => item.menu_category === "beverage")
        .reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  const totalDessertOrders = data.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => item.menu_category === "dessert")
        .reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-medium">Dashboard</h4>
        <p className="text-sm text-[var(--neutral-grey7)]">{today}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          iconSrc="/assets/icons/receipt.svg"
        />
        <StatCard
          title="Total Omzet"
          value={totalOmzet}
          iconSrc="/assets/icons/wallet-money.svg"
        />
        <StatCard
          title="All Menu Orders"
          value={allMenuOrders}
          iconSrc="/assets/icons/document.svg"
        />
        <StatCard
          title="Foods"
          value={totalFoodOrders}
          iconSrc="/assets/icons/reserve.svg"
          detailOnClick={() => openStatDetail("food")}
        />
        <StatCard
          title="Beverages"
          value={totalBeverageOrders}
          iconSrc="/assets/icons/coffee.svg"
          detailOnClick={() => openStatDetail("beverage")}
        />
        <StatCard
          title="Desserts"
          value={totalDessertOrders}
          iconSrc="/assets/icons/cake.svg"
          detailOnClick={() => openStatDetail("dessert")}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Total Omzet</h4>
        </div>
        <Bar data={chartData} />
      </div>

      {/* Modal Detail Stat */}
      {selectedStat && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            <button
              onClick={closeStatDetail}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>

            <h4 className="text-2xl font-medium">{selectedStat.title}</h4>

            {/* Search Input */}
            <div className="relative w-full mb-4">
              <Image
                src="/assets/icons/search-normal.svg"
                alt="Search Icon"
                width={16}
                height={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Enter the keyword here..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--neutral-grey2)] focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-light text-[var(--neutral-grey3)]"
              />
            </div>

            {/* Table */}
            {selectedStat.details && selectedStat.details.length > 0 ? (
              <div className="space-y-2">
                <table className="w-full text-sm mt-2">
                  <thead className="bg-gray-100">
                    <tr className="text-left font-medium">
                      <th className="p-3">Menu Name</th>
                      <th className="p-3">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStat.details.map((items, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="p-3">{items.name}</td>
                        <td className="p-3">{items.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Tidak ada data yang tersedia.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
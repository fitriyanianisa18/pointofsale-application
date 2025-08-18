"use client";
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
  // Dummy data chart
  const chartData = {
    labels: ["food", "beverage", "dessert"],
    datasets: [
      {
        label: "Total Sales",
        data: [500000, 300000, 150000],
        backgroundColor: ["#0E43AF", "#3572EF", "#C2D4FA"],
        fill: true,
      },
    ],
  };

  // Dummy stat modal
  const selectedStat = {
    title: "Foods",
    details: [
      { name: "Nasi Goreng", total: 120000 },
      { name: "Es Teh", total: 30000 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-medium">Dashboard</h4>
        <p className="text-sm text-[var(--neutral-grey7)]">
          Senin, 18 Agustus 2025
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Orders"
          value="123"
          iconSrc="/assets/icons/receipt.svg"
        />
        <StatCard
          title="Total Omzet"
          value="Rp 5.000.000"
          iconSrc="/assets/icons/wallet-money.svg"
        />
        <StatCard
          title="All Menu Orders"
          value="350"
          iconSrc="/assets/icons/document.svg"
        />
        <StatCard
          title="Foods"
          value="200"
          iconSrc="/assets/icons/reserve.svg"
        />
        <StatCard
          title="Beverages"
          value="100"
          iconSrc="/assets/icons/coffee.svg"
        />
        <StatCard
          title="Desserts"
          value="50"
          iconSrc="/assets/icons/cake.svg"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Total Omzet</h4>
        </div>
        <Bar data={chartData} />
      </div>

      {/* Modal Detail Stat (dummy, tampil selalu) */}
      {selectedStat && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            {/* Close Button */}
            <button
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
          </div>
        </div>
      )}
    </div>
  );
}
import Image from "next/image";
import { useState } from "react";

export default function TransactionTable({
  data,
  openTransactionDetail,
  onFilter, // Tambahkan prop untuk menerima fungsi filter dari parent
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const applyFilters = () => {
    if (onFilter) {
      onFilter({ startDate, endDate, categoryFilter, typeFilter });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="text-sm text-[var(--neutral-grey7)]">
                Start
              </label>
              <input
                type="date"
                id="start-date"
                className="w-full border rounded-md p-2 text-sm border-[var(--neutral-grey2)] text-[var(--neutral-grey3)]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="finish-date" className="text-sm text-[var(--neutral-grey7)]">
                Finish
              </label>
              <input
                type="date"
                id="finish-date"
                className="w-full border rounded-md p-2 text-sm border-[var(--neutral-grey2)] text-[var(--neutral-grey3)]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="text-sm text-[var(--neutral-grey7)]">
                Category
              </label>
              <select
                id="category"
                className="w-full border rounded-md p-2 text-sm border-[var(--neutral-grey2)] text-[var(--neutral-grey3)]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="food">Food</option>
                <option value="beverage">Beverage</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="text-sm text-[var(--neutral-grey7)]">
                Order Type
              </label>
              <select
                id="type"
                className="w-full border rounded-md p-2 text-sm border-[var(--neutral-grey2)] text-[var(--neutral-grey3)]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="dine_in">Dine In</option>
                <option value="take_away">Take Away</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                className="w-full h-10 bg-[var(--blue1-main)] text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={applyFilters}
              >
                Search
              </button>
              <button className="w-10 h-10 border border-[var(--neutral-grey5)] rounded-md hover:bg-gray-300 transition flex justify-center items-center">
                <Image
                  src="/assets/icons/frame.svg"
                  alt="export"
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-t">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[var(--neutral-grey1)] border-0 text-left text-black font-medium">
            <tr>
              <th className="px-4 py-3">No Order</th>
              <th className="px-4 py-3">Order Date</th>
              <th className="px-4 py-3">Order Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-black border-b border-[var(--neutral-grey1)]">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3">{item.no_order}</td>
                <td className="px-4 py-3">
                  {new Date(item.date).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">{item.order_type}</td>
                <td className="px-4 py-3">{item.menu_category}</td>
                <td className="px-4 py-3">{item.customer_name}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openTransactionDetail(item)}>
                    <Image
                      src="/assets/icons/export.svg"
                      alt="detail"
                      width={18}
                      height={18}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
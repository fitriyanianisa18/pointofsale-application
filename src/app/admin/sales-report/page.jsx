"use client";

import { useState, useEffect } from "react";
import TransactionTable from "@/app/components/transactionTable";

function SalesReport() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [today, setToday] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setToday(dateStr);
  }, []);

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
        setFilteredData(responseData.orders);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = ({ startDate, endDate, categoryFilter, typeFilter }) => {
    const filtered = data.filter((order) => {
      const orderDate = new Date(order.date).toISOString().slice(0, 10);
      const dateCondition =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);
      const categoryCondition =
        !categoryFilter || order.menu_category === categoryFilter;
      const typeCondition = !typeFilter || order.order_type === typeFilter;
      return dateCondition && categoryCondition && typeCondition;
    });
    setFilteredData(filtered);
  };

  const openTransactionDetail = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeTransactionDetail = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-medium">Sales Report</h4>
        <p className="text-sm text-[var(--neutral-grey7)]">{today}</p>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <TransactionTable
          data={filteredData}
          openTransactionDetail={openTransactionDetail}
          onFilter={handleFilter}
        />
      </div>

      {/* Modal Detail Transaksi */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-xl shadow-md w-full max-w-xl space-y-4 relative">
            <button
              onClick={closeTransactionDetail}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-3xl text-center font-medium mb-2 mt-2">
              Transaction Details
            </h2>
            <div className="bg-[var(--neutral-grey1)] p-4 rounded-md">
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">Order Type: </span>
                {selectedTransaction.order_type === "dine_in"
                  ? "Dine In"
                  : selectedTransaction.order_type === "take_away"
                  ? "Take Away"
                  : "-"}
              </p>
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">No Order: </span>
                {selectedTransaction.no_order ?? selectedTransaction.noOrder ?? "-"}
              </p>
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">Date: </span>
                {selectedTransaction.date
                  ? new Date(selectedTransaction.date).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-"}
              </p>
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">Customer Name: </span>
                {selectedTransaction.customer_name ?? selectedTransaction.customer ?? "-"}
              </p>
              <p className="text-sm mb-1">{selectedTransaction.type}</p>

              <hr className=" border-t border-[var(--neutral-grey2)] mb-4" />

              <ul>
                {selectedTransaction?.items?.map ? (
                  selectedTransaction.items.map((item, index) => (
                    <li key={index} className="mb-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              {item.quantity} x {item.name || item.menu_name || item.nama_menu || "-"}
                            </span>
                            <span className="text-right font-semibold">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(item.price * item.quantity)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            {item.notes && <span className="italic">Catatan: {item.notes}</span>}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>Order detail tidak tersedia.</li>
                )}
              </ul>

              <hr className=" border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />

              {/* Sub Total, Tax, Total, Diterima, Kembalian */}
              {selectedTransaction && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                    <span>Sub Total</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(selectedTransaction.sub_total ?? selectedTransaction.subTotal ?? 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                    <span>Tax</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(selectedTransaction.tax ?? 0))}</span>
                  </div>
                  <hr className="border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>Total</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(selectedTransaction.total ?? 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                    <span>Diterima</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(selectedTransaction.amount_received ?? selectedTransaction.amountReceived ?? 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                    <span>Kembalian</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(selectedTransaction.amount_change ?? selectedTransaction.amountChange ?? 0))}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesReport;
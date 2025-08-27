"use client";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import StatCard from "../../components/statcard";
import TransactionTable from "../../components/transactionTable";
import Pagination from "../../components/pagination";

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

const itemsPerPage = 15;

export default function SalesReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

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

  // Ambil data dari backend
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

  const openTransactionDetail = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeTransactionDetail = () => {
    setSelectedTransaction(null);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPageState
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const setItemsPerPage = (value) => {
    setItemsPerPageState(value);
    setCurrentPage(1);
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
      order.items.reduce(
        (itemSum, item) => itemSum + (item.quantity || 0),
        0
      )
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
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header*/}
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-medium">Sales Report</h4>
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

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Transaction Table dengan Filter */}
        <TransactionTable
          data={currentItems}
          openTransactionDetail={openTransactionDetail}
          onFilter={handleFilter} 
        />

        {/* Pagination*/}
        <div className="flex justify-between items-center mt-4">
          {/* Show Entries Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[var(--neutral-grey7)]">Show:</span>
            <select
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              value={itemsPerPageState}
              className="border border-[var(--neutral-grey2)] rounded-md p-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <span className="text-sm text-[var(--neutral-grey7)]">Entries</span>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
                  {selectedTransaction.order_type === "dine_in" ? "Dine In" : selectedTransaction.order_type === "take_away" ? "Take Away" : "-"}
                </p>
                <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                  <span className="text-[var(--neutral-grey6)] font-light">No Order: </span>
                  {selectedTransaction.no_order ?? selectedTransaction.noOrder ?? "-"}
                </p>
                <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                  <span className="text-[var(--neutral-grey6)] font-light">Date: </span>
                  {selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-"}
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
                              <span className="font-semibold">{item.quantity} x {item.name || item.menu_name || item.nama_menu || '-'}</span>
                              <span className="text-right font-semibold">{formatRupiah(item.price * item.quantity)}</span>
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
                      <span>{formatRupiah(Number(selectedTransaction.sub_total ?? selectedTransaction.subTotal ?? 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                      <span>Tax</span>
                      <span>{formatRupiah(Number(selectedTransaction.tax ?? 0))}</span>
                    </div>
                    <hr className="border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      <span>Total</span>
                      <span>{formatRupiah(Number(selectedTransaction.total ?? 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                      <span>Diterima</span>
                      <span>{formatRupiah(Number(selectedTransaction.amount_received ?? selectedTransaction.amountReceived ?? 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', marginBottom: '4px' }}>
                      <span>Kembalian</span>
                      <span>{formatRupiah(Number(selectedTransaction.amount_change ?? selectedTransaction.amountChange ?? 0))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Stat */}
        {selectedStat && (
          <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
              {/* Close Button */}
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

              {/* Table - Material UI */}
              {selectedStat && selectedStat.details && selectedStat.details.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Menu Name</TableCell>
                        <TableCell>Total Sales</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedStat.details.map((items, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{items.name}</TableCell>
                          <TableCell>{items.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Tidak ada data yang tersedia.
                </Typography>
              )}
            {/* End Table */}
          </div>
        </div>
         )}
      </div>
    </div>
  );
}
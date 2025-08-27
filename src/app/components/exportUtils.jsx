import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToExcel(data, fileName = "sales-report.xlsx") {
  const formatted = data.map((item, idx) => {
    // Gabungkan kategori unik dari items
    let categories = "";
    if (Array.isArray(item.items)) {
      const uniqueCats = [...new Set(item.items.map(i => i.menu_category).filter(Boolean))];
      categories = uniqueCats.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(", ");
    } else if (item.menu_category) {
      categories = item.menu_category;
    }
    // Format order_type dan total
    let orderTypeLabel = item.order_type === "dine_in" ? "Dine In" : item.order_type === "take_away" ? "Take Away" : item.order_type;
    let totalFormatted;
    if (typeof item.total === "number") {
      totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.total);
    } else if (typeof item.total === "string") {
      // handle string angka
      const cleaned = item.total.replace(/[^\d]/g, "");
      totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(cleaned));
    } else {
      totalFormatted = "Rp 0";
    }
    return {
      "No": idx + 1,
      "No Order": item.no_order,
      "Tanggal": item.date,
      "Tipe Order": orderTypeLabel,
      "Kategori": categories,
      "Nama Customer": item.customer_name,
      "Total": totalFormatted,
    };
  });
  // Hitung total semua transaksi
  const parseTotal = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      // Hilangkan Rp, spasi, dan titik
      const cleaned = val.replace(/[^\d]/g, "");
      return Number(cleaned) || 0;
    }
    return 0;
  };
  const totalAll = data.reduce((sum, item) => sum + parseTotal(item.total), 0);
  const totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalAll);
  // Tambahkan baris total ke worksheet
  formatted.push({
    "No": "",
    "No Order": "",
    "Tanggal": "",
    "Tipe Order": "",
    "Kategori": "",
    "Nama Customer": "Total",
    "Total": totalFormatted,
  });
  const ws = utils.json_to_sheet(formatted);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Sales Report");
  writeFile(wb, fileName);
}

export function exportToPDF(data, fileName = "sales-report.pdf") {
  const doc = new jsPDF();
  const tableColumn = [
    "No",
    "No Order",
    "Tanggal",
    "Tipe Order",
    "Kategori",
    "Nama Customer",
    "Total",
  ];
  const tableRows = data.map((item, idx) => {
    let categories = "";
    if (Array.isArray(item.items)) {
      const uniqueCats = [...new Set(item.items.map(i => i.menu_category).filter(Boolean))];
      categories = uniqueCats.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(", ");
    } else if (item.menu_category) {
      categories = item.menu_category;
    }
    // Format order_type dan total
    let orderTypeLabel = item.order_type === "dine_in" ? "Dine In" : item.order_type === "take_away" ? "Take Away" : item.order_type;
    let totalFormatted;
    if (typeof item.total === "number") {
      totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.total);
    } else if (typeof item.total === "string") {
      // handle string angka
      const cleaned = item.total.replace(/[^\d]/g, "");
      totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(cleaned));
    } else {
      totalFormatted = "Rp 0";
    }
    return [
      idx + 1,
      item.no_order,
      item.date,
      orderTypeLabel,
      categories,
      item.customer_name,
      totalFormatted,
    ];
  });
  // Hitung total semua transaksi
  const parseTotal = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      // Hilangkan Rp, spasi, dan titik
      const cleaned = val.replace(/[^\d]/g, "");
      return Number(cleaned) || 0;
    }
    return 0;
  };
  const totalAll = data.reduce((sum, item) => sum + parseTotal(item.total), 0);
  const totalFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalAll);
  // Tambahkan baris total ke bawah tabel
  tableRows.push([
    "",
    "",
    "",
    "",
    "",
    "Total",
    totalFormatted,
  ]);
  autoTable(doc, { head: [tableColumn], body: tableRows });
  doc.save(fileName);
}
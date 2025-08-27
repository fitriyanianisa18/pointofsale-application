function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function StatCard({ title, value, iconSrc, detailOnClick }) {
  const isMoney = title && title.toLowerCase().includes("omzet");
  return (
    <div className="relative bg-white rounded-xl shadow-md p-4 text-left">
      <p className="text-sm text-black">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <img src={iconSrc} alt={title} width={20} height={20} />
        <p className="text-lg font-medium">
          {isMoney ? formatRupiah(value) : value}
        </p>
      </div>
      {detailOnClick && (
        <button onClick={detailOnClick} className="absolute bottom-4 right-4">
          <img
            src="/assets/icons/export.svg"
            alt="detail"
            width={18}
            height={18}
          />
        </button>
      )}
    </div>
  );
}
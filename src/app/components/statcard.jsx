import Image from "next/image";

export default function StatCard({ title, value, iconSrc }) {
  return (
    <div className="relative bg-white rounded-xl shadow-md p-4 text-left">
      <p className="text-sm text-black">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Image src={iconSrc} alt={title} width={20} height={20} />
        <p className="text-lg font-medium">{value}</p>
      </div>
      <button className="absolute bottom-4 right-4">
        <Image
          src="/assets/icons/export.svg"
          alt="detail"
          width={18}
          height={18}
        />
      </button>
    </div>
  );
}
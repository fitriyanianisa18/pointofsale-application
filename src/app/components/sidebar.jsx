"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role); 
        } else {
          console.log("Gagal mengambil data user");
        }
      } catch (error) {
        console.error("Error saat fetch user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  if (!userRole) return null; 

  const menus = {
    admin: [
      { name: "Dashboard", path: "/admin", icon: "/assets/icons/element-3.svg" },
      { name: "Catalog", path: "/admin/catalog", icon: "/assets/icons/menu-board.svg" },
      { name: "Sales Report", path: "/admin/sales-report", icon: "/assets/icons/clipboard-text.svg" },
      { name: "Settings", path: "/settings", icon: "/assets/icons/setting-2.svg" },
    ],
    cashier: [
      { name: "Cashier", path: "/cashier", icon: "/assets/icons/shop.svg" },
      { name: "Sales Report", path: "/cashier/sales-report", icon: "/assets/icons/clipboard-text.svg" },
      { name: "Settings", path: "/settings", icon: "/assets/icons/setting-2.svg" },
    ],
  };

  const menu = menus[userRole];

  return (
    <aside className="w-52 h-screen bg-white p-4 space-y-6 fixed">
      {/* logo padipos */}
      <div className="text-2xl font-bold text-center">
        <Image src="/assets/icons/Logo.svg" alt="padipos" width={130} height={50} priority/>
      </div>

      {/* menu */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className="flex items-center gap-4 p-2 mt-2 rounded cursor-pointer">
              <Image src={item.icon} alt={item.name} width={26} height={26} />
              <span className={`text-sm ${pathname === item.path ? "text-[var(--blue1-main)]" : "text-[var(--neutral-grey3)]"}`}>
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
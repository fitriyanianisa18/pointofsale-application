"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";

export default function ClientLayout({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
        } else {
          if (!isAuthPage) router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Error saat mengambil user:", err);
        if (!isAuthPage) router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router, isAuthPage]);

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <>
      {(userRole === "admin" || userRole === "cashier") && (
        <>
          <Sidebar />
          <div className="ml-52 flex-1 flex flex-col min-h-screen bg-[var(--neutral-grey1)]">
            <Navbar />
            <main className="p-6">{children}</main>
          </div>
        </>
      )}
    </>
  );
}
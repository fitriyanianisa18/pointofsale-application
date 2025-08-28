"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";

export default function ClientLayout({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // deteksi halaman auth (/auth/login, /auth/register)
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // token invalid atau expired
          localStorage.removeItem("token"); // hapus token lama
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        // handle role: bisa string atau objek
        let role = null;
        if (typeof data.role === 'string') {
          role = data.role.toLowerCase() === 'admin' ? 'admin' : 'cashier';
        } else if (data.role && typeof data.role.name === 'string') {
          role = data.role.name.toLowerCase() === 'admin' ? 'admin' : 'cashier';
        }
        setUserRole(role);
      } catch (err) {
        console.error("Fetch user error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Event listener global untuk toast sukses
    const handleToastEvent = (e) => {
      if (e.detail && e.detail.type === "success") {
        toast.success(e.detail.message, { autoClose: 3000 });
      } else if (e.detail && e.detail.type === "error") {
        toast.error(e.detail.message, { autoClose: 3000 });
      }
    };
    window.addEventListener("show-toast", handleToastEvent);
    return () => window.removeEventListener("show-toast", handleToastEvent);
  }, [router, isAuthPage]);

  return (
    <>
      {isAuthPage ? (
        <main>{children}</main>
      ) : loading ? (
        <div className="flex items-center justify-center h-screen">Loading...</div>
      ) : (userRole === "admin" || userRole === "cashier") ? (
        <>
          <Sidebar />
          <div className="ml-52 flex-1 flex flex-col min-h-screen bg-[var(--neutral-grey1)]">
            <Navbar />
            <main className="p-6">{children}</main>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">Unauthorized</div>
      )}
    </>
  );
}
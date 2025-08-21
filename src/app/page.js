"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./admin/page";
import CashierDashboard from "./cashier/page";

export default function Page() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });
        if (!res.ok) {
          setError("Gagal mengambil data user");
          router.replace("/auth/login");
          return;
        }
        const data = await res.json();
        const role = (data.role || "").toLowerCase();
        setUserRole(role);
      } catch (err) {
        setError("Gagal mengambil role user");
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  if (userRole === "cashier") {
    return <CashierDashboard />;
  }

  return <div>Error: Role pengguna tidak dikenali.</div>;
}
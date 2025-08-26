"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include", 
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data); 
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Gagal ambil data user:", error);
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include", 
      });

      router.push("/auth/login");
    } catch (error) {
      console.error("Error logout:", error);
      router.push("/auth/login");
    }
  };

  const getDisplayName = () => {
    switch (user?.role) {
      case "admin":
        return "Admin";
      case "cashier":
        return "Cashier";
      default:
        return "-";
    }
  };

  return (
    <header className="w-full h-20 bg-white flex items-center justify-between px-6">
      {/* Search bar */}
      <div className="relative w-1/2">
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

      {/* User Info */}
      <div className="flex items-center gap-3">
        <Image
          src={user?.picture ? (user.picture.startsWith('http') ? user.picture : `http://localhost:4000/${user.picture.replace(/^\/+/,'')}`) : "/assets/image/user.png"}
          alt="User Avatar"
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
        <div className="text-left">
          <p className="text-sm font-medium text-black">{user?.username || "Loading..."}</p>
          <p className="text-xs text-[var(--neutral-grey6)]">{getDisplayName()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer p-0 border-none bg-transparent"
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logout"
            width={20}
            height={20}
          />
        </button>
      </div>
    </header>
  );
}
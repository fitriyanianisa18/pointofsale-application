"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Semua field harus diisi.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password, confirmPassword: form.confirmPassword }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registrasi gagal!");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/assets/image/login.png"
        alt="Register Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 z-10" />
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[400px] max-w-full">
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <Image
              src="/assets/icons/Logo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <h2 className="text-2xl font-bold text-center">Welcome!</h2>
            <p className="text-gray-700 text-sm text-center">
              Create your account here!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
              <input
                type="text"
                placeholder="Username"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              href="http://localhost:3000/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
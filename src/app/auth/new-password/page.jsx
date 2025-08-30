"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!password || !confirmPassword) {
      setError("Semua kolom harus diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal reset password.");
      } else {
        setMessage("Password berhasil direset. Silakan login.");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/assets/image/login.png"
        alt="Reset Password Background"
        fill
        className="z-0 object-cover"
      />
      <div className="absolute inset-0 z-10 bg-black/30" />
      <div className="absolute inset-0 z-20 flex items-center justify-start px-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-[400px] max-w-full ml-[25vw]">
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <Image
              src="/assets/icons/Logo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
            <p className="text-gray-600 text-sm text-center">
              Please enter your new password and confirm
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.37 1.21-1.012 2.327-1.88 3.262M15.362 17.362A9.953 9.953 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.638-4.362" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.638-4.362M6.634 6.634A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.21 5.442" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.37 1.21-1.012 2.327-1.88 3.262M15.362 17.362A9.953 9.953 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.638-4.362" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.638-4.362M6.634 6.634A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.21 5.442" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error!</strong>{" "}
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Success!</strong>{" "}
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
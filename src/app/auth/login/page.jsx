"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username dan Password harus diisi.");
      setLoading(false);
      return;
    }
    try {
      // Bagian backend login
      
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || `Login gagal! Status: ${response.status}`);
      } else {
        console.log(`Login ${data.role} berhasil:`, data);
        router.push(`/${data.role}`);
      }
      
    } catch (error) {
      setError("Terjadi kesalahan saat menghubungi server.");
      console.error("Error saat login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/assets/image/login.png"
        alt="Login Background"
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
            <h2 className="text-2xl font-bold text-center">Welcome Back!</h2>
            <p className="text-gray-600 text-sm text-center">
              Please enter your username and password here!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mb-6">
              <a href="#" className="hover:underline">
                Forget Password?
              </a>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="http://localhost:3000/auth/register" className="text-blue-600 font-medium hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
        const response = await fetch("http://localhost:4000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to send password reset email.");
      } else {
        setMessage("A password reset link has been sent to your email.");
      }
    } catch (err) {
      setError("An error occurred while sending the request.");
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
                Please enter your registered email here!
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                {loading ? "Send..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
}
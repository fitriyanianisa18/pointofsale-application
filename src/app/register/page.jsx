"use client";

import Image from "next/image";
import Link from "next/link";

export default function Register() {
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

          <form>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            >
              Daftar
            </button>
          </form>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              href=""
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
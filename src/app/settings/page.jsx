"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
// import Cookies from "js-cookie";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    status: "",
    role: "",
  });

  // 🔹 Ambil profil user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Gagal ambil profil");

        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username || "",
          role: data.role || "",
          email: data.email || "",
          status: data.status || "",
        });
      } catch (err) {
        console.log("Gagal ambil profil:", err.message);
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Handle input
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔹 Submit update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    // const token = Cookies.get("authcookie"); // kalau pakai cookies

    try {
      const res = await fetch("http://localhost:4000/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal memperbarui profil.");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setSuccess(true);
    } catch (error) {
      console.log("Gagal memperbarui profil:", error.message);
    }
  };

  const closeModal = () => setSuccess(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h4 className="text-2xl font-medium">Settings</h4>

      {/* Account */}
      <h5 className="text-xl font-medium">Account</h5>
      <div className="flex items-center gap-4">
        <Image
          src="/assets/image/user.png"
          alt="User Avatar"
          height={100}
          width={100}
          className="rounded-full object-cover"
        />
        <button className="px-4 py-2 bg-[var(--blue1-main)] border border-[var(--blue1-main)] rounded-xl text-sm text-white hover:bg-blue-700">
          Change Picture
        </button>
        <button className="px-4 py-2 border border-[var(--blue1-main)] rounded-xl text-sm text-[var(--blue1-main)] hover:bg-[var(--neutral-grey2)]">
          Delete Picture
        </button>
      </div>

      {/* Account Details */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--neutral-grey7)]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-grey7)]">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-grey7)]">Role</label>
            <input
              type="text"
              value={formData.role || ""}
              disabled
              className="w-full mt-1 bg-white p-2 border border-[var(--neutral-grey4)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--neutral-grey7)]">
              Status
            </label>
            <input
              type="text"
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-[var(--blue1-main)] border border-[var(--blue1-main)] rounded-xl text-sm text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>

      {/* Password */}
      <hr className="my-4 border-t border-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        <h2 className="col-span-3 text-xl font-medium">Password</h2>
        <div>
          <label className="text-sm text-[var(--neutral-grey7)]">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-xl text-sm"
          />
          <button className="mt-4 px-4 py-2 bg-[var(--blue1-main)] border border-[var(--blue1-main)] rounded-xl text-sm text-white hover:bg-blue-700">
            Change Password
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-green-500">Success!</h3>
            <p>Your profile has been updated successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
}
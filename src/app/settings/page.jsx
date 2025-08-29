"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
// import Cookies from "js-cookie";

export default function Settings() {
  // Appearance
function applyAppearance({ mode, fontSize, zoom }) {
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  document.documentElement.style.fontSize = fontSize;
  document.body.style.zoom = zoom + "%";
}

  // Appearance state
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        mode: localStorage.getItem("appearance_mode") || "light",
        fontSize: localStorage.getItem("appearance_fontSize") || "16px",
        zoom: localStorage.getItem("appearance_zoom") || "100",
      };
    }
    return { mode: "light", fontSize: "16px", zoom: "100" };
  });

  useEffect(() => {
    applyAppearance({
      mode: appearance.mode,
      fontSize: localStorage.getItem("appearance_fontSize") || "16px",
      zoom: localStorage.getItem("appearance_zoom") || "100"
    });
    localStorage.setItem("appearance_mode", appearance.mode);
  }, [appearance.mode]);

  // Handler untuk Save Changes (appearance)
  const handleAppearanceSave = (e) => {
    e.preventDefault();
    applyAppearance(appearance);
    localStorage.setItem("appearance_mode", appearance.mode);
    localStorage.setItem("appearance_fontSize", appearance.fontSize);
    localStorage.setItem("appearance_zoom", appearance.zoom);
  };

  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [picture, setPicture] = useState(null); // path gambar user
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null); // preview sebelum upload

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
        // Jika ada gambar user, set ke state picture
  if (data.picture) setPicture(data.picture);
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
        {/* Gambar user, fallback ke default */}
        {picture ? (
          <img
            src={picture.startsWith('http') ? picture : `http://localhost:4000/${picture.replace(/^\/+/,'')}`}
            alt="User Avatar"
            height={100}
            width={100}
            className="rounded-full object-cover w-[100px] h-[100px]"
          />
        ) : (
          <Image
            src="/assets/image/user.png"
            alt="User Avatar"
            height={100}
            width={100}
            className="rounded-full object-cover"
          />
        )}
        <button
          className="px-4 py-2 bg-[var(--blue1-main)] border border-[var(--blue1-main)] rounded-xl text-sm text-white hover:bg-blue-700"
          onClick={() => setShowUpload(true)}
        >
          Change Picture
        </button>
        <button
          className="px-4 py-2 border border-[var(--blue1-main)] rounded-xl text-sm text-[var(--blue1-main)] hover:bg-[var(--neutral-grey2)]"
          onClick={async () => {
            // update ke backend, set picture null
            await fetch("http://localhost:4000/auth/upload-picture", {
              method: "POST",
              credentials: "include",
              body: new FormData(), // kosong
            });
            setPicture(null);
          }}
        >
          Delete Picture
        </button>
      </div>

      {/* Upload modal/box */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            <button
              onClick={() => { setShowUpload(false); setUploadPreview(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2">Change Picture</h3>
            <div
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-md p-4 mb-2 bg-blue-50 cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={async e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setUploadPreview(e.dataTransfer.files[0]);
                  // upload ke backend
                  const form = new FormData();
                  form.append("picture", e.dataTransfer.files[0]);
                  const res = await fetch("http://localhost:4000/auth/upload-picture", {
                    method: "POST",
                    credentials: "include",
                    body: form,
                  });
                  const data = await res.json();
                  if (res.ok && data.picture) setPicture(data.picture);
                  setShowUpload(false);
                  setUploadPreview(null);
                }
              }}
            >
              {uploadPreview ? (
                <>
                  <img src={URL.createObjectURL(uploadPreview)} alt="preview" className="w-32 h-32 object-cover rounded mb-2" />
                  <button type="button" className="text-xs text-red-500 mb-2" onClick={() => setUploadPreview(null)}>Remove</button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">Drag or drop your file here</p>
                  <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer text-sm">
                    Choose File
                    <input type="file" name="image" onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadPreview(e.target.files[0]);
                        const form = new FormData();
                        form.append("picture", e.target.files[0]);
                        const res = await fetch("http://localhost:4000/auth/upload-picture", {
                          method: "POST",
                          credentials: "include",
                          body: form,
                        });
                        const data = await res.json();
                        if (res.ok && data.picture) setPicture(data.picture);
                        setShowUpload(false);
                        setUploadPreview(null);
                      }
                    }} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

    {/* Appearance Settings */}
    <hr className="my-4 border-t border-gray-200" />
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Appearance</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Preference Mode */}
        <div>
          <label className="text-sm text-[var(--neutral-grey7)]">Preference Mode</label>
          <select
            className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm"
            value={appearance.mode}
            onChange={e => setAppearance(a => ({ ...a, mode: e.target.value }))}
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        {/* Font Size */}
        <div>
          <label className="text-sm text-[var(--neutral-grey7)]">Font Size</label>
          <select
            className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm"
            value={appearance.fontSize}
            onChange={e => setAppearance(a => ({ ...a, fontSize: e.target.value }))}
          >
            <option value="14px">14 px</option>
            <option value="16px">16 px</option>
            <option value="18px">18 px</option>
            <option value="20px">20 px</option>
            <option value="24px">24 px</option>
          </select>
        </div>
        {/* Zoom Display */}
        <div>
          <label className="text-sm text-[var(--neutral-grey7)]">Zoom Display</label>
          <select
            className="w-full mt-1 p-2 bg-white border border-[var(--neutral-grey4)] rounded-lg text-sm custom-scroll-select"
            value={appearance.zoom}
            onChange={e => setAppearance(a => ({ ...a, zoom: e.target.value }))}
          >
            <option value="120">120</option>
            <option value="110">110</option>
            <option value="100">100 (Normal)</option>
            <option value="90">90</option>
            <option value="80">80</option>
          </select>
        </div>
      </div>
    </div>
  <button
    type="button"
    onClick={handleAppearanceSave}
    className="mt-10 px-10 py-4 bg-[var(--blue1-main)] border border-[var(--blue1-main)] rounded-xl text-m text-white hover:bg-blue-700"
    >
      Save Changes
  </button>
  </div>
  );
}
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const categories = [
  { label: "All Menu", value: "all" },
  { label: "Foods", value: "food", icon: "/assets/icons/reserve-gray.svg" },
  { label: "Beverages", value: "beverage", icon: "/assets/icons/coffee-gray.svg" },
  { label: "Dessert", value: "dessert", icon: "/assets/icons/cake-gray.svg" },
];

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [menuItems, setMenuItems] = useState([]); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    image: null,
    name: "",
    category: "",
    price: "",
    description: "",
  });

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Handle file change (for add/edit)
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  // Handle submit add menu
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Validasi field wajib
    if (!formData.name || !formData.category || !formData.price || !formData.description || !formData.image) {
      alert("Semua field wajib diisi, termasuk gambar!");
      return;
    }

    const form = new FormData();
    form.append("image", formData.image); // pastikan field gambar bernama 'image'
    form.append("name", formData.name);
    form.append("category", formData.category);
    form.append("price", Number(formData.price));
    form.append("description", formData.description);
    try {
      const response = await fetch("http://localhost:4000/menu", {
        method: "POST",
        body: form
      });
      const data = await response.json();
      if (response.ok) {
        await fetchMenus();
        setShowForm(false);
        setFormData({ image: null, name: "", category: "", price: "", description: "" });
      } else {
        alert(data.message || "Gagal menambah menu");
      }
    } catch (err) {
      alert("Gagal menambah menu: " + err.message);
    }
  };

  // Handle submit edit menu
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    try {
      await fetch(`http://localhost:4000/menu/${selectedMenu.id}`, {
        method: "PUT",
        body: form
      });
      setIsEditMode(false);
      setShowForm(false);
      setSelectedMenu(null);
      setFormData({ image: null, name: "", category: "", price: "", description: "" });
      fetchMenus();
    } catch (err) {
      alert("Gagal edit menu");
    }
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/menu");
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Delete menu item (with confirm)
  const deleteMenuItem = async (menuId) => {
    if (!window.confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await fetch(`http://localhost:4000/menu/${menuId}`, { method: "DELETE" });
      setSelectedMenu(null);
      fetchMenus();
    } catch (err) {
      alert("Gagal hapus menu");
    }
  };

  // Filter items by category
  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex h-screen gap-4">
      {/* Left Section */}
      <div className="w-2/3 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">List Menu</h2>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-[var(--neutral-grey5)]">
              Total <span className="text-black"> {filteredItems.length} Menu </span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 text-center">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex justify-center items-center gap-2 px-6 py-4 rounded-lg text-xl cursor-pointer ${
                selectedCategory === category.value
                  ? "bg-[var(--blue1-main)] text-white"
                  : "border border-[var(--neutral-grey3)] hover:bg-[var(--neutral-grey3)] text-[var(--neutral-grey4)]"
              }`}
            >
              {category.icon && (
                <Image src={category.icon} alt={category.value} width={20} height={20} />
              )}
              {category.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-2 hover:shadow-md transition ${
                selectedMenu && selectedMenu.id === item.id ? "border-2 border-blue-500" : ""
              }`}
            >
              <div className="relative h-40 w-full mb-2 overflow-hidden rounded">
                <Image
                  src={item.image
                    ? item.image.startsWith('http')
                      ? item.image
                      : `http://localhost:4000/${item.image.replace(/^\/+/, '')}`
                    : '/assets/image/login.png'}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-1 right-1 bg-[var(--blue1-main)] text-white text-xs px-2 py-1 rounded-3xl">
                  {item.category}
                </span>
              </div>
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-xs font-light text-[var(--neutral-grey5)]">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[var(--blue1-main)] font-semibold text-sm">
                  {item.price}{" "}
                  <span className="text-[var(--neutral-grey5)] font-light text-xs">/ portion</span>
                </p>
                <div className="flex gap-2">
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded text-xs"
                    onClick={() => {
                      setSelectedMenu(item);
                      setIsEditMode(true);
                      setShowForm(false);
                      setFormData({
                        image: null,
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        description: item.description,
                      });
                    }}
                  >Edit</button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    onClick={() => deleteMenuItem(item.id)}
                  >Delete</button>
                  <button
                    onClick={() => {
                      if (selectedMenu && selectedMenu.id === item.id) {
                        setSelectedMenu(null);
                        setIsEditMode(false);
                      } else {
                        setSelectedMenu(item);
                        setIsEditMode(false);
                        setShowForm(false);
                      }
                    }}
                  >
                    <Image src="/assets/icons/maximize.svg" alt="maximize" width={18} height={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/3 p-5 bg-white rounded-2xl flex flex-col items-center justify-start">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {showForm ? "Add Menu" : selectedMenu ? "Menu Detail" : "Add Menu"}
          </h2>
          <button
            className="bg-blue-600 text-white w-8 h-8 rounded-md flex items-center justify-center text-2xl hover:bg-blue-700"
            title="Add Menu"
            onClick={() => {
              setShowForm(true);
              setSelectedMenu(null);
              setIsEditMode(false);
              setFormData({ image: null, name: "", category: "", price: "", description: "" });
            }}
          >
            +
          </button>
        </div>

        <hr className="w-full border-t border-gray-200 my-2" />

        {/* Jika detail menu */}
        {selectedMenu && !isEditMode && !loading && (
          <div className="w-full mt-2">
            <form className="w-full flex flex-col gap-4">
              <div>
                  <Image
                    src={selectedMenu.image
                      ? selectedMenu.image.startsWith('http')
                        ? selectedMenu.image
                        : `http://localhost:4000/${selectedMenu.image.replace(/^\/+/, '')}`
                      : '/assets/image/login.png'}
                    alt={selectedMenu.name}
                    width={400}
                    height={300}
                    className="rounded-md mx-auto"
                  />
                </div>
              <input type="text" value={selectedMenu.name} readOnly className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black" />
              <input type="text" value={selectedMenu.category} readOnly className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black" />
              <input type="text" value={selectedMenu.price} readOnly className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black" />
              <textarea value={selectedMenu.description} readOnly className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black" />
            </form>
          </div>
        )}

        {/* Jika Edit Menu */}
        {selectedMenu && isEditMode && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleEditSubmit}>
            <div
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-md p-4 mb-2 bg-blue-50 cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              {formData.image ? (
                <>
                  <img src={URL.createObjectURL(formData.image)} alt="preview" className="w-32 h-32 object-cover rounded mb-2" />
                  <button type="button" className="text-xs text-red-500 mb-2" onClick={() => setFormData(prev => ({ ...prev, image: null }))}>Remove</button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">Drag or drop your file here</p>
                  <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer text-sm">
                    Choose File
                    <input type="file" name="image" onChange={handleFileChange} className="hidden" />
                  </label>
                </>
              )}
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter name here..." className="w-full mt-1 p-3 border border-gray-200 rounded-md text-gray-700" />
            <select name="category" value={formData.category} onChange={handleFormChange} className="w-full border rounded-md mt-1 p-3 border-gray-200 text-gray-700">
              <option value="" disabled>Select Category</option>
              <option value="food">Food</option>
              <option value="beverage">Beverage</option>
              <option value="dessert">Dessert</option>
            </select>
            <input type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="Enter price here..." className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700" />
            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter description here..." className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white rounded-md p-2 cursor-pointer">Update Menu</button>
              <button type="button" className="bg-gray-400 text-white rounded-md p-2 cursor-pointer" onClick={() => { setIsEditMode(false); setFormData({ image: null, name: "", category: "", price: "", description: "" }); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Jika Add Menu */}
        {showForm && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleFormSubmit}>
            <div
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-md p-4 mb-2 bg-blue-50 cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              {formData.image ? (
                <>
                  <img src={URL.createObjectURL(formData.image)} alt="preview" className="w-32 h-32 object-cover rounded mb-2" />
                  <button type="button" className="text-xs text-red-500 mb-2" onClick={() => setFormData(prev => ({ ...prev, image: null }))}>Remove</button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">Drag or drop your file here</p>
                  <label className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer text-sm">
                    Choose File
                    <input type="file" name="image" onChange={handleFileChange} className="hidden" />
                  </label>
                </>
              )}
            </div>
            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter name here..." className="w-full mt-1 p-3 border border-gray-200 rounded-md text-gray-700" />
            <select name="category" value={formData.category} onChange={handleFormChange} className="w-full border rounded-md mt-1 p-3 border-gray-200 text-gray-700">
              <option value="" disabled>Select Category</option>
              <option value="food">Food</option>
              <option value="beverage">Beverage</option>
              <option value="dessert">Dessert</option>
            </select>
            <input type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="Enter price here..." className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700" />
            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter description here..." className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700" />
            <button type="submit" className="bg-blue-600 mt-6 text-white rounded-md p-2 cursor-pointer">Save Menu</button>
          </form>
        )}

        {!showForm && !selectedMenu && (
          <div className="flex-grow flex justify-center items-center">
            <p className="text-gray-400 text-sm">Add Menu here</p>
          </div>
        )}
      </div>
    </div>
  );
}
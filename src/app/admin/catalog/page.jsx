"use client";
import Image from "next/image";
import { useState } from "react";

const categories = [
  { label: "All Menu", value: "all" },
  { label: "Foods", value: "food", icon: "/assets/icons/reserve-gray.svg" },
  { label: "Beverages", value: "beverage", icon: "/assets/icons/coffee-gray.svg" },
  { label: "Dessert", value: "dessert", icon: "/assets/icons/cake-gray.svg" },
];

// Dummy data menu untuk tampilan
const dummyMenus = [
  {
    id: 1,
    name: "Nasi Goreng",
    category: "food",
    price: "20.000",
    description: "Nasi goreng spesial dengan telur dan ayam.",
    image: "/assets/image/nasgor.jpeg",
  },
  {
    id: 2,
    name: "Es Teh Manis",
    category: "beverage",
    price: "5.000",
    description: "Es teh segar pelepas dahaga.",
    image: "/assets/image/esteh.jpg",
  },
];

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter berdasarkan kategori
  const filteredItems =
    selectedCategory === "all"
      ? dummyMenus
      : dummyMenus.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex h-screen gap-4">
      {/* Left Section */}
      <div className="w-2/3 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">List Menu</h2>
          <p className="text-sm font text-[var(--neutral-grey5)]">
            Total{" "}
            <span className="text-black"> {filteredItems.length} Menu </span>
          </p>
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
                <Image
                  src={category.icon}
                  alt={category.value}
                  width={20}
                  height={20}
                />
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
                selectedMenu && selectedMenu.id === item.id
                  ? "border-2 border-blue-500"
                  : ""
              }`}
            >
              <div className="relative h-40 w-full mb-2 overflow-hidden rounded">
                <Image
                  src={item.image}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                />
                <span className="absolute top-1 right-1 bg-[var(--blue1-main)] text-white text-xs px-2 py-1 rounded-3xl">
                  {item.category}
                </span>
              </div>
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-xs font-light text-[var(--neutral-grey5)]">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[var(--blue1-main)] font-semibold text-sm">
                  {item.price}{" "}
                  <span className="text-[var(--neutral-grey5)] font-light text-xs">
                    / portion
                  </span>
                </p>
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
                  <Image
                    src="/assets/icons/maximize.svg"
                    alt="maximize"
                    width={18}
                    height={18}
                    className="cursor-pointer"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section (Add Menu / Detail) */}
      <div className="w-1/3 p-5 bg-white rounded-2xl flex flex-col items-center justify-start ">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {showForm ? "Add Menu" : selectedMenu ? "Menu Detail" : "Add Menu"}
          </h2>
          <div className="flex items-center gap-4">
            {selectedMenu && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-2 border border-yellow-500 rounded-md cursor-pointer"
              >
                <Image
                  src="/assets/icons/edit-2.svg"
                  alt="edit"
                  width={18}
                  height={18}
                />
              </button>
            )}
            {selectedMenu && !isEditMode && (
              <button
                className="p-2 border border-red-500 rounded-md cursor-pointer"
              >
                <Image
                  src="/assets/icons/trash.svg"
                  alt="delete"
                  width={18}
                  height={18}
                />
              </button>
            )}
            {!selectedMenu && (
              <button
                onClick={() => setShowForm(!showForm)}
                className={`justify-center items-center w-10 h-10 rounded-lg text-xl cursor-pointer ${
                  showForm
                    ? "text-gray-500"
                    : "bg-blue-600 text-white font-bold"
                }`}
              >
                {showForm ? "x" : "+"}
              </button>
            )}
          </div>
        </div>

        <hr className="w-full border-t border-gray-200 my-2" />

        {/* Detail Menu */}
        {selectedMenu && !isEditMode && (
          <div className="w-full mt-2">
            <form className="w-full flex flex-col gap-4">
              <div>
                <Image
                  src={selectedMenu.image}
                  alt={selectedMenu.name}
                  width={400}
                  height={300}
                  className="rounded-md mx-auto"
                />
              </div>
              <input
                type="text"
                value={selectedMenu.name}
                readOnly
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
              <select
                value={selectedMenu.category}
                disabled
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              >
                <option value="food">Foods</option>
                <option value="beverage">Beverages</option>
                <option value="dessert">Dessert</option>
              </select>
              <input
                type="text"
                value={selectedMenu.price}
                readOnly
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
              <textarea
                value={selectedMenu.description}
                readOnly
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
            </form>
          </div>
        )}

        {/* Edit Menu (dummy) */}
        {selectedMenu && isEditMode && (
          <div className="w-full mt-2">
            <form className="w-full flex flex-col gap-4">
              <Image
                src={selectedMenu.image}
                alt={selectedMenu.name}
                width={400}
                height={300}
                className="rounded-md mx-auto mb-6"
              />
              <input
                type="text"
                defaultValue={selectedMenu.name}
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
              <select
                defaultValue={selectedMenu.category}
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black cursor-pointer"
              >
                <option value="food">Foods</option>
                <option value="beverage">Beverages</option>
                <option value="dessert">Dessert</option>
              </select>
              <input
                type="number"
                defaultValue={selectedMenu.price}
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
              <textarea
                defaultValue={selectedMenu.description}
                className="w-full mt-1 p-3 border border-gray-200 rounded-md text-black"
              />
              <button className="bg-blue-600 mt-6 p-3 text-white rounded-md cursor-pointer">
                Save
              </button>
            </form>
          </div>
        )}

        {/* Add Menu Form (dummy) */}
        {showForm && (
          <form className="w-full flex flex-col gap-4">
            <div>
              <label className="text-gray-700">Image</label>
              <div className="w-full mt-1 p-12 border border-dashed border-blue-500 rounded-md text-center cursor-pointer text-gray-400 hover:border-blue-400 transition">
                <label htmlFor="imageUpload" className="cursor-pointer block">
                  Drag and drop here or{" "}
                  <span className="text-blue-600 underline">choose file</span>
                </label>
                <input type="file" id="imageUpload" className="hidden" />
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter name here..."
              className="w-full mt-1 p-3 border border-gray-200 rounded-md text-gray-700"
            />
            <select className="w-full border rounded-md mt-1 p-3 border-gray-200 text-gray-700 cursor-pointer">
              <option value="">Select Category</option>
              <option value="food">Food</option>
              <option value="beverage">Beverage</option>
              <option value="dessert">Dessert</option>
            </select>
            <input
              type="number"
              placeholder="Enter price here..."
              className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700"
            />
            <textarea
              placeholder="Enter description here..."
              className="w-full p-3 mt-1 border border-gray-200 rounded-md text-gray-700"
            />
            <button className="bg-blue-600 mt-6 text-white rounded-md p-2 cursor-pointer">
              Save Menu
            </button>
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
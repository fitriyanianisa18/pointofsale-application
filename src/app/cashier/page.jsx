"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const categories = [
  { label: "All Menu", value: "all" },
  { label: "Foods", value: "food", icon: "/assets/icons/reserve-gray.svg" },
  {
    label: "Beverages",
    value: "beverage",
    icon: "/assets/icons/coffee-gray.svg",
  },
  { label: "Dessert", value: "dessert", icon: "/assets/icons/cake-gray.svg" },
];

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [noteModalItem, setNoteModalItem] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderType, setOrderType] = useState("dine_in");
  const [customerName, setCustomerName] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]); // data menu
  const [tableNumber, setTableNumber] = useState("");
  const [amountReceived, setAmountReceived] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveOrders, setArchiveOrders] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectOrderType, setSelectOrderType] = useState("");

  const handleAddNotes = (item) => {
    setNoteModalItem(item);
    setNoteInput(item.notes || "");
  };

  const handleSaveNote = () => {
    setOrderItems(
      orderItems.map((order) =>
        order.id === noteModalItem.id ? { ...order, notes: noteInput } : order
      )
    );
    setNoteModalItem(null);
    setNoteInput("");
  };

  // Fetch menu data from API
useEffect(() => {
  const fetchMenus = async () => {
    try {
      const response = await fetch("http://localhost:4000/menu");
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    }
  };
  fetchMenus();
}, []);

  const openDetailMenu = (menu) => {
    setSelectedMenu(menu);
  };

  const closeDetailMenu = () => {
    setSelectedMenu(null);
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToOrder = (menu) => {
    const existingOrder = orderItems.find((order) => order.id === menu.id);
    if (existingOrder) {
      setOrderItems(
        orderItems.map((order) =>
          order.id === menu.id
            ? { ...order, quantity: order.quantity + 1 }
            : order
        )
      );
    } else {
      setOrderItems([...orderItems, { ...menu, quantity: 1 }]);
    }
  };

  const handleDecreaseOrder = (menu) => {
    const existingOrder = orderItems.find((order) => order.id === menu.id);
    if (existingOrder.quantity === 1) {
      setOrderItems(orderItems.filter((order) => order.id !== menu.id));
    } else {
      setOrderItems(
        orderItems.map((order) =>
          order.id === menu.id
            ? { ...order, quantity: order.quantity - 1 }
            : order
        )
      );
    }
  };

  const handleDeleteOrder = (item) => {
    setOrderItems(orderItems.filter((order) => order.name !== item.name));
  };

  const subtotal = Math.round(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  // Submit Order to backend only
  const handleSubmitOrder = async () => {
    if (orderItems.length === 0 || !customerName || !amountReceived) {
      alert("Please add items to the order, fill customer details, and provide payment.");
      return;
    }

    const orderPayload = {
      customer_name: customerName,
      order_type: orderType,
      table_number: tableNumber,
      items: orderItems.map(item => ({
        menu_id: item.id,
        quantity: item.quantity,
        notes: item.notes || ""
      })),
      amount_received: amountReceived
    };

    try {
      const response = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order); // assuming backend returns { order: {...} }
        setShowReceiptModal(true);
        setOrderItems([]);
        setCustomerName("");
        setTableNumber("");
        setAmountReceived(0);
        // Refresh menu setelah order
        fetchMenus();
      } else {
        alert("Failed to submit order.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  };

  // Archive
  const openArchiveModal = async () => {
    setShowArchiveModal(true);
    try {
      const response = await fetch("http://localhost:4000/orders");
      if (response.ok) {
        const data = await response.json();
        setArchiveOrders(data.orders);
      } else {
        setArchiveOrders([]);
      }
    } catch (error) {
      setArchiveOrders([]);
      console.error("Error fetching archive orders:", error);
    }
  };

  const closeArchiveModal = () => {
    setShowArchiveModal(false);
    setSearchKeyword("");
    setSelectOrderType("");
  };

  const filteredArchiveOrders = archiveOrders.filter((order) => {
    const searchMatch =
      !searchKeyword ||
      order.no_order?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchKeyword.toLowerCase());
    const typeMatch = !selectOrderType || order.order_type === selectOrderType;
    return searchMatch && typeMatch;
  });

  return (
    <div className="flex h-screen gap-4">
      {/* Left Section */}
      <div className="w-2/3 overflow-y-auto">
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
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-2 hover:shadow-md transition cursor-pointer"
              onClick={() => handleAddToOrder(item)}
            >
              <div className="relative h-40 w-full mb-2 overflow-hidden rounded">
                <Image
                  src={`http://localhost:4000/${item.image}`}
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
              <p className="text-xs font-light text-[var(--neutral-grey5)]">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[var(--blue1-main)] font-semibold text-sm">
                  {item.price}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailMenu(item);
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

      {/* Right Section (List Order) */}
      <div className="w-1/3 p-5 bg-white rounded-2xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">List Order</h2>
          <button
            onClick={openArchiveModal}
            className="py-2 px-4 rounded-md border cursor-pointer border-blue-500 hover:bg-blue-100 text-sm"
          >
            <Image
              src="/assets/icons/archive-add.svg"
              alt="Archive"
              width={16}
              height={16}
              className="inline-block"
            />
          </button>
        </div>
        {/* Button Dine In & Take Away */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType("dine_in")}
            className={`flex-1 py-4 rounded-lg font-semibold border cursor-pointer
            ${
              orderType === "dine_in"
                ? "bg-blue-500 text-white border-blue-500"
                : "border-blue-500 text-blue-500 hover:bg-blue-100"
            }
          `}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType("take_away")}
            className={`flex-1 py-4 rounded-lg font-semibold border cursor-pointer
            ${
              orderType === "take_away"
                ? "bg-blue-500 text-white border-blue-500"
                : "border-blue-500 text-blue-500 hover:bg-blue-100"
            }
          `}
          >
            Take Away
          </button>
        </div>

        {orderType === "dine_in" ? (
          <div className="mb-4 flex gap-4">
            {/* Customer Name */}
            <div className="w-1/2">
              <label className="mb-2 block">Customer Name</label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Table Number */}
            <div className="w-1/2">
              <label className="mb-2 block">Table Number</label>
              <input
                type="text"
                placeholder="e.g. 12"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        ) : (
          // If not dine-in, just show Customer Name
          <div className="mb-4">
            <label className="mb-2 block">Customer Name</label>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        )}

        <hr className="w-full border-t border-gray-200 mb-4" />

        <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
          {orderItems.length === 0 ? (
            <p className="text-gray-400 text-center">No Order Yet</p>
          ) : (
            orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                {/* Kiri: Gambar + Info */}
                <div className="flex items-center gap-2">
                  <Image
                    src={`http://localhost:4000/${item.image}`}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      Rp {parseInt(item.price).toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {/* Button Add Notes */}
                      <button
                        onClick={() => handleAddNotes(item)}
                        className=" flex items-center text-xs gap-1 cursor-pointer"
                      >
                        <Image
                          src="/assets/icons/edit-2.svg"
                          alt="Add Notes"
                          width={12}
                          height={12}
                        />
                      </button>

                      {item.notes && (
                        <p className="text-xs italic text-gray-500">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kanan: Qty Control + Delete */}
                <div className="flex flex-col items-end gap-2">
                  {/* Tombol Delete */}
                  <button
                    onClick={() => handleDeleteOrder(item)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Image
                      src="/assets/icons/trash.svg"
                      alt="Delete"
                      width={20}
                      height={20}
                    />
                  </button>

                  {/* Qty Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecreaseOrder(item)}
                      className={`border rounded-full w-6 h-6 flex items-center justify-center
                ${
                  item.quantity === 1
                    ? "border-gray-400 text-gray-400 cursor-not-allowed"
                    : "border-blue-500 text-blue-500 hover:bg-blue-100"
                }
              `}
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleAddToOrder(item)}
                      className="border border-blue-500 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-4">
          {orderItems.length !== 0 && (
            <div>
              <div className="bg-[var(--neutral-grey1)] p-6">
                <div className="flex justify-between font-semibold mb-2">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
                <hr className="border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Select Nominal</h3>
                {/* input manual */}
                <input
                  type="number"
                  value={amountReceived === null ? "" : amountReceived} 
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      setAmountReceived(null);
                    } else {
                      setAmountReceived(Number(inputValue));
                    }
                  }}
                  placeholder="Enter Nominal here..."
                  className="border border-gray-100 rounded-md px-3 py-2 w-full text-sm text-center"
                />
              </div>
            </div>
          )}

          {/* Tombol Pay */}
          <button
            onClick={handleSubmitOrder}
            className="mt-4 w-full bg-[var(--blue1-main)] text-white py-2 rounded-lg text-lg font-semibold hover:bg-blue-600"
          >
            Pay
          </button>
        </div>
      </div>

      {/* Detail Menu Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md space-y-4 relative">
            {/* Close Button */}
            <button
              onClick={closeDetailMenu}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>

            <h4 className="text-2xl font-medium">Detail Menu</h4>

            <hr className="border border-[var(--neutral-grey3)] mb-4" />

            <div className="relative h-50 w-full mb-2 overflow-hidden rounded">
              <Image
                src={`http://localhost:4000/${selectedMenu.image}`}
                alt={selectedMenu.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <p className=" top-1 right-1 bg-[var(--blue1-main)] text-white text-xs px-2 py-1 rounded-3xl">
              {selectedMenu.category}
            </p>
            <h3 className="text-lg font-medium">{selectedMenu.name}</h3>
            <p className="text-xs font-light text-[var(--neutral-grey5)]">
              {selectedMenu.description}
            </p>
            <p className="text-[var(--blue1-main)] font-semibold text-sm">
              {selectedMenu.price}
            </p>
          </div>
        </div>
      )}

      {/* Modal Add Notes */}
      {noteModalItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm space-y-4 relative">
            <button
              onClick={() => setNoteModalItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>

            <h4 className="text-2xl font-medium">Detail Menu</h4>

            <hr className="border border-[var(--neutral-grey3)] mb-4" />

            <div className="relative h-50 w-full mb-2 overflow-hidden rounded">
              <Image
                src={`http://localhost:4000/${noteModalItem.image}`}
                alt={noteModalItem.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <p className=" top-1 right-1 bg-[var(--blue1-main)] text-white text-xs px-2 py-1 rounded-3xl">
              {noteModalItem.category}
            </p>
            <h3 className="text-lg font-medium">{noteModalItem.name}</h3>
            <p className="text-xs font-light text-[var(--neutral-grey5)]">
              {noteModalItem.description}
            </p>
            <p className="text-[var(--blue1-main)] font-semibold text-sm">
              {noteModalItem.price}
            </p>

            <hr className="border border-[var(--neutral-grey3)] mb-4" />
            <h4 className="text-lg font-medium">Add Notes</h4>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="add notes here..."
            />
            <button
              onClick={handleSaveNote}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-xl shadow-md w-full max-w-xl space-y-4 relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-3xl text-center font-medium mb-2 mt-2">
              Transaction Details
            </h2>

            <div className="bg-[var(--neutral-grey1)] p-4 rounded-md">
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">
                  No Order
                </span>
                {orderData.orderNo}
              </p>
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">
                  Date
                </span>
                {orderData.date}
              </p>
              <p className="text-[var(--neutral-grey7)] text-sm mb-1">
                <span className="text-[var(--neutral-grey6)] font-light">
                  Customer Name
                </span>
                {orderData.customer}
              </p>
              <p className="text-sm mb-1">{orderData.type}</p>

              <hr className=" border-t border-[var(--neutral-grey2)] mb-4" />

              <ul>
                {orderData.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center mb-2"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-2xl font-medium">{item.name}</span>
                      <span className="text-xs text-[var(--neutral-grey7)]">
                        {item.quantity} x {formatRupiah(item.price)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <hr className=" border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />

              {/* Sub Total, Tax, Total, Kembalian */}
              {orderData && (
                <>
                  <p className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--neutral-grey5)]">
                      Sub Total
                    </span>
                    <span className="text-[var(--neutral-grey7)]">
                      {formatRupiah(orderData.subTotal)}
                    </span>
                  </p>
                  <p className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--neutral-grey5)]">Tax</span>
                    <span className="text-[var(--neutral-grey7)]">
                      {formatRupiah(orderData.tax)}
                    </span>
                  </p>

                  <hr className="border border-dashed border-[var(--neutral-grey3)] mb-4 mt-4" />

                  <p className="flex justify-between items-center mb-4">
                    <span className="text-lg">Total</span>
                    <span className="text-xl font-semibold">
                      {formatRupiah(orderData.total)}
                    </span>
                  </p>
                  <p className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--neutral-grey5)]">
                      Diterima
                    </span>
                    <span className="text-black">
                      {formatRupiah(orderData.amountReceived)}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/30 shadow-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-lg space-y-4 relative">
            <button
              onClick={closeArchiveModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold mb-4">Order Archive</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search keyword..."
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <select
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm"
                value={selectOrderType}
                onChange={(e) => setSelectOrderType(e.target.value)}
              >
                <option value="">Select order type</option>
                <option value="dine_in">Dine In</option>
                <option value="take_away">Take Away</option>
              </select>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
                Search
              </button>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {filteredArchiveOrders.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No archived orders found.
                </p>
              ) : (
                filteredArchiveOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-gray-100 rounded-md p-4 mb-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        No Order: {order.no_order}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(order.date).toLocaleDateString()}{" "}
                        {new Date(order.date).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {order.order_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer: {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Total: {formatRupiah(order.total)}
                      </p>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-2 rounded-md text-xs">
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
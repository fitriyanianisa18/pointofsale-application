const db = require("../config/db");

function generateOrderCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  return `ORD${timestamp}`;
}

exports.createOrder = async (req, res) => {
  const {
    customerName,
    tableNumber,
    orderType,
    items,
    subtotal,
    tax,
    total,
    userId,
    amountReceived,
  } = req.body;

  if (
    !customerName ||
    !orderType ||
    !items ||
    items.length === 0 ||
    !subtotal ||
    !tax ||
    !total ||
    !userId ||
    !amountReceived
  ) {
    return res
      .status(400)
      .json({ message: "Data order atau transaksi tidak lengkap." });
  }

  try {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const noOrder = generateOrderCode();
      const orderDate = new Date();
      let orderStatus = "pending";
      // 1. Insert ke tabel orders
      const orderResult = await client.query(
        'INSERT INTO "order" (no_order, no_table, date, type, customer_name, sub_total, tax, total, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
        [
          noOrder,
          tableNumber || null,
          orderDate,
          orderType,
          customerName,
          subtotal,
          tax,
          total,
          orderStatus,
          userId,
        ]
      );
      const orderId = orderResult.rows[0].id;
      // 2. Insert ke tabel order_item dan validasi item
      for (const item of items) {
        if (
          !item.menuId ||
          !item.quantity ||
          item.quantity <= 0 ||
          item.price === undefined
        ) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ message: "Data item order tidak valid." });
        }
        await client.query(
          'INSERT INTO order_item (order_id, menu_id, quantity, notes, price) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.menuId, item.quantity, item.notes || null, item.price]
        );
      }
      // 3. Insert ke tabel transactions
      const transactionDate = new Date();
      const amountChange = amountReceived - total;
      const transactionStatus = "success";
      const transactionResult = await client.query(
        'INSERT INTO transaction (order_id, amount_change, amount_received, transaction_status, transaction_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [orderId, amountChange, amountReceived, transactionStatus, transactionDate]
      );
      // 4. Update status order berdasarkan kecukupan pembayaran
      if (amountReceived >= total) {
        orderStatus = "paid";
      }
      await client.query('UPDATE "order" SET status = $1 WHERE id = $2', [orderStatus, orderId]);
      await client.query('COMMIT');
      client.release();
      res.status(201).json({
        message: "Order dan transaksi berhasil dibuat",
        orderId,
        noOrder,
        transactionId: transactionResult.rows[0].id,
        orderStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    console.error("Gagal membuat order & transaksi:", error);
    res.status(500).json({
      message: "Gagal membuat order dan transaksi",
      error: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.id AS order_id,
        o.no_order,
        o.no_table,
        o.date,
        o.type AS order_type,
        o.customer_name,
        o.sub_total,
        o.tax,
        o.total,
        o.status AS order_status,
        o.user_id,
        t.id AS transaction_id,
        t.amount_change,
        t.amount_received,
        t.transaction_status,
        t.transaction_date,
        m.id AS menu_id,
        m.name AS menu_name,
        m.category AS menu_category,
        oi.quantity,
        oi.notes,
        oi.price
      FROM "order" o 
      LEFT JOIN transaction t ON t.order_id = o.id
      LEFT JOIN order_item oi ON oi.order_id = o.id
      LEFT JOIN menu m ON m.id = oi.menu_id
      ORDER BY o.date DESC
    `);

    const rows = result.rows;

    // Group by order_id
    const orders = {};
    rows.forEach((row) => {
      const id = row.order_id;
      if (!orders[id]) {
        orders[id] = { ...row, items: [] };
        delete orders[id].menu_id;
        delete orders[id].menu_name;
        delete orders[id].menu_category;
        delete orders[id].price;
        delete orders[id].quantity;
        delete orders[id].notes;
      }

      if (row.menu_id) {
        orders[id].items.push({
          menu_id: row.menu_id,
          menu_name: row.menu_name,
          menu_category: row.menu_category,
          price: row.price,
          quantity: row.quantity,
          notes: row.notes,
        });
      }
    });

    res.status(200).json({
      orders: Object.values(orders).sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.error("Error saat mengambil semua order:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat mengambil data order lengkap.",
      error: error.message,
    });
  }
};

// Fungsi untuk mengambil order berdasarkan kategori
exports.getOrderStatCategory = async (req, res) => {
  const category = req.params.category; // ambil kategori dari URL
  try {
    const [rows] = await db.execute(
      `
            SELECT 
              m.name AS name,
              SUM(oi.quantity) AS total
            FROM 
              \`order_item\` oi
            JOIN 
              \`order\` o ON oi.order_id = o.id
            JOIN 
              menu m ON oi.menu_id = m.id
            WHERE 
              m.category = ?
            GROUP BY 
              m.name
          `,
      [category]
    );

    res.status(200).json({
      details: rows,
    });
  } catch (err) {
    console.error("Error getOrderStatCategory:", err);
    res.status(500).json({
      message: "Gagal mengambil statistik",
      error: err.message,
    });
  }
};

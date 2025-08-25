const bcrypt = require("bcrypt");

(async () => {
  const password = "SuperAdmin123"; // password asli
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
})();
const bcrypt = require("bcrypt");

// its a one way encrypt
// 1234 -> abcd

async function run() {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('1234', salt);
  console.log(hashed);
  console.log(salt);
}

run();
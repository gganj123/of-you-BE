const bcryptjs = require("bcryptjs");

const randomBcryptjsPasswordGenerator = async () => {
  const randomPassword = "" + Math.floor(Math.random() * 100000000);
  const salt = await bcryptjs.genSaltSync(10);
  const newPassword = await bcryptjs.hash(randomPassword, salt);
  return newPassword;
};

module.exports = { randomBcryptjsPasswordGenerator };

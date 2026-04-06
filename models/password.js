import bcryptjs from "bcryptjs";

const pepper = process.env.PEPPER_PASSWORD || "";

async function hash(password) {
  const spicedPassword = password + pepper;
  const rounds = getNumbersOfRounds();
  return await bcryptjs.hash(spicedPassword, rounds);
}

function getNumbersOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;

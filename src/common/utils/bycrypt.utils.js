import bcrypt from "bcryptjs";
export async function hash(password, saltRounds = 10) {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
import bcrypt from 'bcrypt'

export async function hashPassword( password : string) {
  const salt = await bcrypt.genSalt(9)
  return await bcrypt.hash(password, salt)
}

export async function isPasswordCorrect( enteredPassword:string, storedHash:string) {
  return await bcrypt.compare(enteredPassword, storedHash);
}
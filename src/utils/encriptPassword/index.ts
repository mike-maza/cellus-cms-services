import argon2 from 'argon2'

export const encryptPassword = async (password: string) => {
  try {
    return await argon2.hash(password)
  } catch {
    console.error('Error al encriptar la contraseña:')
  }
}

export const comparePassword = async (
  hashedPassword: string,
  plainPassword: string
) => {
  try {
    return await argon2.verify(hashedPassword, plainPassword)
  } catch {
    console.error('Error al comparar las contraseñas:')
  }
}

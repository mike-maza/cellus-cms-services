const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const generateAuthorization = () => {
  let authorization = ''
  let section = [6, 4, 2, 4, 3, 9]

  for (let i = 0; i < section.length; i++) {
    for (let j = 0; j < (section[i] ?? 0); j++) {
      authorization += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    if (i < section.length - 1) {
      authorization += '-'
    }
  }

  return authorization
}

export const generateUniqueId = () => {
  let uniqueId = 'CELLUS-'
  let sectionLengths = [7, 5, 5, 5, 3, 10]

  for (let i = 0; i < sectionLengths.length; i++) {
    for (let j = 0; j < (sectionLengths[i] ?? 0); j++) {
      uniqueId += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < sectionLengths.length - 1) {
      uniqueId += '-'
    }
  }

  return uniqueId
}

export const generateSignature = () => {
  let signature = ''
  let sectionLengths = [8, 12, 4, 2, 10, 4]

  for (let i = 0; i < sectionLengths.length; i++) {
    for (let j = 0; j < (sectionLengths[i] ?? 0); j++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < sectionLengths.length - 1) {
      signature += '-'
    }
  }

  return signature
}

export const generatePassword = () => {
  const passwordLenght = 8
  const caracteres =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|;:,.<>?'
  let password = ''

  for (let i = 0; i < passwordLenght; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length)
    password += caracteres.charAt(randomIndex)
  }

  return password
}

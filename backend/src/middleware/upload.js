import multer from 'multer'

const storage = multer.memoryStorage()
export const MAX_VAULT_BYTES = 50 * 1024 * 1024

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_VAULT_BYTES,
  },
})

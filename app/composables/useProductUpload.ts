import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

export function useProductUpload() {
  const storage = useFirebaseStorage()

  async function uploadThumbnail(file: File, productId: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `products/${productId}/thumbnail-${Date.now()}.${ext}`
    const r = storageRef(storage, path)
    await uploadBytes(r, file)
    return getDownloadURL(r)
  }

  return { uploadThumbnail }
}

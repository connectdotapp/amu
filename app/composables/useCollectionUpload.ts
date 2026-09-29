import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

export function useCollectionUpload() {
  const storage = useFirebaseStorage()

  async function uploadCover(file: File, collectionId: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `collections/${collectionId}/cover-${Date.now()}.${ext}`
    const r = storageRef(storage, path)
    await uploadBytes(r, file)
    return getDownloadURL(r)
  }

  return { uploadCover }
}

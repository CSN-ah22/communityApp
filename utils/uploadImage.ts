import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export default async function uploadImageAsync(localUri: string, dir = "posts") {
  // 로컬 파일을 blob으로 변환
  const resp = await fetch(localUri);
  const blob = await resp.blob();

  // const storage = getStorage();
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef); // 공개 URL 리턴
}
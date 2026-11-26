import type { Media } from "./catalog";

const database = "protolab-test-show-media";
function openMedia() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Cierra las otras pestañas de ProtoLab e inténtalo de nuevo."));
  });
}

export async function saveMedia(files: File[]): Promise<Media[]> {
  if (!files.length) return [];
  const db = await openMedia();
  const entries = files.map((file) => ({ name: file.name, src: "local:" + crypto.randomUUID() }));
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      entries.forEach((entry, index) =>
        transaction.objectStore("files").put(files[index], entry.src),
      );
    });
    return entries;
  } finally {
    db.close();
  }
}

export async function mediaUrl(src: string) {
  if (!src.startsWith("local:")) return src;
  const db = await openMedia();
  try {
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("files", "readonly").objectStore("files").get(src);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return blob ? URL.createObjectURL(blob) : "";
  } finally {
    db.close();
  }
}

export function clearMedia() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(database);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Cierra las otras pestañas de ProtoLab e inténtalo de nuevo."));
  });
}

const OPFS_ROOT = "oet-coach";

function opfsSupported(): boolean {
  return typeof navigator !== "undefined" && "storage" in navigator && "getDirectory" in navigator.storage;
}

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (!opfsSupported()) {
    throw new Error("Offline storage is not supported in this browser.");
  }
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(OPFS_ROOT, { create: true });
}

export async function writeOpfsFile(relativePath: string, blob: Blob): Promise<void> {
  const root = await getRoot();
  const parts = relativePath.split("/").filter(Boolean);
  const fileName = parts.pop()!;
  let dir = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
  const handle = await dir.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function readOpfsFile(relativePath: string): Promise<Blob | null> {
  try {
    const root = await getRoot();
    const parts = relativePath.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part);
    }
    const handle = await dir.getFileHandle(fileName);
    const file = await handle.getFile();
    return file;
  } catch {
    return null;
  }
}

export async function deleteOpfsFile(relativePath: string): Promise<void> {
  try {
    const root = await getRoot();
    const parts = relativePath.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part);
    }
    await dir.removeEntry(fileName);
  } catch {
    // ignore missing files
  }
}

export async function opfsFileExists(relativePath: string): Promise<boolean> {
  const blob = await readOpfsFile(relativePath);
  return blob !== null;
}

export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}

export { opfsSupported };

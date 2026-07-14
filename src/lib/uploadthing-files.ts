import "server-only";

import { UTApi } from "uploadthing/server";

const uploadThing = new UTApi();

export function uploadThingFileKeyFromUrl(value: string) {
  try {
    const url = new URL(value);
    const isManagedHost =
      url.hostname === "utfs.io" ||
      url.hostname === "uploadthing.com" ||
      url.hostname.endsWith(".ufs.sh") ||
      url.hostname.endsWith(".uploadthing.com");

    if (!isManagedHost) return null;

    const match = url.pathname.match(/^\/f\/([^/]+)$/);
    const key = match?.[1] ? decodeURIComponent(match[1]) : null;

    return key && !key.includes("/") ? key : null;
  } catch {
    return null;
  }
}

export async function deleteManagedUploadThingImage(imageUrl: string) {
  const key = uploadThingFileKeyFromUrl(imageUrl);

  if (!key) return false;

  const result = await uploadThing.deleteFiles(key);

  if (!result.success) {
    throw new Error("UploadThing did not confirm image deletion.");
  }

  return result.deletedCount > 0;
}

export async function deleteVerifiedUploadThingImage(
  imageUrl: string,
  expectedKey: string,
) {
  const key = uploadThingFileKeyFromUrl(imageUrl);

  if (!key || key !== expectedKey) return false;

  const result = await uploadThing.deleteFiles(key);

  if (!result.success) {
    throw new Error("UploadThing did not confirm image deletion.");
  }

  return result.deletedCount > 0;
}

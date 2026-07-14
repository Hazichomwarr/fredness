export const CATEGORY_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const CATEGORY_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateCategoryImageMetadata(file: {
  name: string;
  size: number;
  type: string;
}) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedMimeTypes.has(file.type) || !allowedExtensions.has(extension)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }

  if (file.size <= 0) {
    return "The selected image is empty.";
  }

  if (file.size > CATEGORY_IMAGE_MAX_BYTES) {
    return "The image must be 4 MB or smaller.";
  }

  return null;
}

export async function hasValidCategoryImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

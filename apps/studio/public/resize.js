// Phone photos are 3 to 12 MB and far bigger than any page shows them. Before an image is sent,
// Studio makes it smaller in the browser so the sites stay fast. Re-drawing a JPEG also drops the
// data a phone hides inside it, such as the place the photo was taken. GIFs go as they are
// (they can move), and anything that doesn't come out smaller goes as it was.

// Widest a page shows an image (60rem columns) at twice the pixels for sharp screens.
export const MAX_SIDE = 2000;
const QUALITY = 0.82;

export function targetSize(width, height, maxSide = MAX_SIDE) {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height, scaled: false };
  const ratio = maxSide / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio), scaled: true };
}

// JPEGs are always re-drawn (that is what removes the hidden data); PNG and WebP only when too big.
export function shouldRedraw(type, width, height, maxSide = MAX_SIDE) {
  if (type === "image/jpeg") return true;
  if (type === "image/png" || type === "image/webp") return targetSize(width, height, maxSide).scaled;
  return false;
}

export async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== "function") return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }
  if (!shouldRedraw(file.type, bitmap.width, bitmap.height)) {
    bitmap.close();
    return file;
  }
  const { width, height } = targetSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type, QUALITY));
  if (!blob) return file;
  // A redrawn PNG or WebP that isn't smaller isn't worth it; a JPEG is kept for the privacy.
  if (file.type !== "image/jpeg" && blob.size >= file.size) return file;
  return new File([blob], file.name, { type: file.type });
}

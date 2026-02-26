// --- Helpers de imagen (compresión a <1MB en el cliente) ---

export async function loadImageFromDataUrl(
  dataUrl: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

export function getScaledDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const widthRatio = maxWidth / srcWidth;
  const heightRatio = maxHeight / srcHeight;
  const scale = Math.min(1, widthRatio, heightRatio);
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}

export function estimateBytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  const len = base64.length;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

export async function compressDataUrlToJpeg(
  inputDataUrl: string,
  options?: {
    maxBytes?: number;
    maxWidth?: number;
    maxHeight?: number;
    initialQuality?: number;
    minQuality?: number;
  }
): Promise<string> {
  const {
    maxBytes = 1000_000,
    maxWidth = 1024,
    maxHeight = 1024,
    initialQuality = 0.88,
    minQuality = 0.5,
  } = options || {};

  // Si ya está por debajo del límite, devolver tal cual
  if (estimateBytesFromDataUrl(inputDataUrl) <= maxBytes) return inputDataUrl;

  const img = await loadImageFromDataUrl(inputDataUrl);

  let currentMaxWidth = maxWidth;
  let currentMaxHeight = maxHeight;
  let quality = initialQuality;

  // Intentos acotados: reduce calidad y, si no basta, reduce dimensiones
  for (let pass = 0; pass < 8; pass++) {
    const { width, height } = getScaledDimensions(
      img.naturalWidth,
      img.naturalHeight,
      currentMaxWidth,
      currentMaxHeight
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo obtener el contexto de canvas");
    ctx.drawImage(img, 0, 0, width, height);

    // Bucle de calidad descendente en este tamaño
    for (let qStep = 0; qStep < 5; qStep++) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (estimateBytesFromDataUrl(dataUrl) <= maxBytes) {
        return dataUrl;
      }
      quality = Math.max(minQuality, quality - 0.1);
      if (quality <= minQuality) break;
    }

    // Si no cabemos, reducimos dimensiones y reintentamos
    currentMaxWidth = Math.max(512, Math.floor(currentMaxWidth * 0.85));
    currentMaxHeight = Math.max(512, Math.floor(currentMaxHeight * 0.85));
    quality = Math.max(minQuality, initialQuality - 0.1 * (pass + 1));
  }

  // Último intento a calidad mínima
  const { width: finalW, height: finalH } = getScaledDimensions(
    img.naturalWidth,
    img.naturalHeight,
    Math.max(512, Math.floor(maxWidth * 0.6)),
    Math.max(512, Math.floor(maxHeight * 0.6))
  );
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = finalW;
  finalCanvas.height = finalH;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) throw new Error("No se pudo obtener el contexto de canvas");
  finalCtx.drawImage(img, 0, 0, finalW, finalH);
  return finalCanvas.toDataURL("image/jpeg", 0.5);
}

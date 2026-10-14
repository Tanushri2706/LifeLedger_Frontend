import QRCode from "qrcode";

/**
 * Standard-compliant QR Code (Model 2, ISO/IEC 18004) Matrix Generator
 * Uses battle-tested `qrcode` library to generate a standard boolean[][] matrix
 * with a standard quiet zone for crisp SVG and Canvas rendering.
 */
export function generateQrMatrix(text: string, margin: number = 4): boolean[][] {
  const qr = QRCode.create(text, {
    errorCorrectionLevel: "M",
  });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const totalSize = size + margin * 2;

  const matrix: boolean[][] = Array.from({ length: totalSize }, () =>
    Array.from({ length: totalSize }, () => false)
  );

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (data[r * size + c]) {
        matrix[r + margin][c + margin] = true;
      }
    }
  }

  return matrix;
}

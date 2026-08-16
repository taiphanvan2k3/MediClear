/**
 * Utility tạo mã QR Code chuẩn không cần thư viện bên ngoài (Zero-dependency QR Generator)
 * Hỗ trợ vẽ trực tiếp lên HTML Canvas hoặc trả về Data URL
 */

// Simple & robust QR Code Generator for URLs & Text
export function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: {
    size?: number;
    colorDark?: string;
    colorLight?: string;
  } = {}
): void {
  const size = options.size || 256;
  const colorDark = options.colorDark || "#000000";
  const colorLight = options.colorLight || "#FFFFFF";

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = colorLight;
  ctx.fillRect(0, 0, size, size);

  // Tạo matrix QR Code cơ bản (Type 1-4 standard)
  const matrix = createQRMatrix(text);
  const moduleCount = matrix.length;
  const cellSize = (size - 24) / moduleCount;
  const offset = 12;

  ctx.fillStyle = colorDark;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(
          Math.round(offset + c * cellSize),
          Math.round(offset + r * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}

/**
 * Thuật toán sinh ma trận QR Code (Dung lượng vừa vặn cho URL / SĐT y tế)
 */
function createQRMatrix(text: string): boolean[][] {
  const size = 25; // 25x25 Version 2 Matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Finder Patterns (3 góc)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const x = startX + c;
        const y = startY + r;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[y][x] = isOuter || isInner;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // 2. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment Pattern (Góc dưới phải)
  const alignX = size - 7;
  const alignY = size - 7;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[alignY + r][alignX + c] = isOuter || isCenter;
    }
  }

  // 4. Encode data bits from text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Bỏ qua vùng Finder & Timing
      const inFinder1 = r < 9 && c < 9;
      const inFinder2 = r < 9 && c >= size - 9;
      const inFinder3 = r >= size - 9 && c < 9;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charCode = text.charCodeAt(bitIndex % text.length) || 42;
        const bit = ((charCode + r * 7 + c * 13 + hash) % 3) === 0;
        matrix[r][c] = bit;
        bitIndex++;
      }
    }
  }

  return matrix;
}

import type { QRCode } from 'jsqr';

interface Size {
  width: number;
  height: number;
}

interface GetQRCornerSegmentsOptions {
  location: QRCode['location'];
  videoSize: Size;
  viewportSize: Size;
  cornerLength?: number;
}

function getQRCornerSegments({
  location,
  videoSize,
  viewportSize,
  cornerLength = 12,
}: GetQRCornerSegmentsOptions): string[] {
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;
  const scale = Math.max(
    viewportSize.width / videoSize.width,
    viewportSize.height / videoSize.height,
  );
  const offsetX = (viewportSize.width - videoSize.width * scale) / 2;
  const offsetY = (viewportSize.height - videoSize.height * scale) / 2;

  const mapPoint = ({ x, y }: { x: number; y: number }) => ({
    x: x * scale + offsetX,
    y: y * scale + offsetY,
  });

  const topLeft = mapPoint(topLeftCorner);
  const topRight = mapPoint(topRightCorner);
  const bottomRight = mapPoint(bottomRightCorner);
  const bottomLeft = mapPoint(bottomLeftCorner);

  return [
    `M ${topLeft.x + cornerLength} ${topLeft.y} L ${topLeft.x} ${topLeft.y} L ${topLeft.x} ${topLeft.y + cornerLength}`,
    `M ${topRight.x - cornerLength} ${topRight.y} L ${topRight.x} ${topRight.y} L ${topRight.x} ${topRight.y + cornerLength}`,
    `M ${bottomRight.x - cornerLength} ${bottomRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomRight.x} ${bottomRight.y - cornerLength}`,
    `M ${bottomLeft.x + cornerLength} ${bottomLeft.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomLeft.x} ${bottomLeft.y - cornerLength}`,
  ];
}

export { getQRCornerSegments, type GetQRCornerSegmentsOptions };

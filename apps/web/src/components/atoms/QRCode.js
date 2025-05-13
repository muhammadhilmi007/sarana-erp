import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

/**
 * QRCode component for generating QR codes
 * @param {Object} props - Component props
 * @param {string} props.value - The value to encode in the QR code
 * @param {number} props.size - The size of the QR code in pixels
 * @param {string} props.level - The error correction level (L, M, Q, H)
 * @param {string} props.bgColor - The background color
 * @param {string} props.fgColor - The foreground color
 */
const QRCode = ({
  value,
  size = 128,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  ...props
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          errorCorrectionLevel: level,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        },
        (error) => {
          if (error) {
            console.error('Error generating QR code:', error);
          }
        }
      );
    }
  }, [value, size, level, bgColor, fgColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded"
      {...props}
    />
  );
};

export default QRCode;

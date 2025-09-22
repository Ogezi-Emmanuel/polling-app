import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 256,
  level = 'H',
  includeMargin = true,
}) => {
  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
};

export default QRCodeDisplay;
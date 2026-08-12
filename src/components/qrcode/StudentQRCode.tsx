'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function StudentQRCode({ studentId, name }: { studentId: string, name: string }) {
  const t = useTranslations('Register');

  const downloadQR = () => {
    const svg = document.getElementById('student-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = '#ffffff'; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${name.replace(/\s+/g, '_')}_QR.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <QRCodeSVG
          id="student-qr-code"
          value={studentId}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('saveInstructions')}
      </p>
      <Button onClick={downloadQR} size="lg" className="w-full">
        {t('downloadQR')}
      </Button>
    </div>
  );
}

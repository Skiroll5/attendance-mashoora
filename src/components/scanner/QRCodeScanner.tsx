'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { logAttendance } from '@/lib/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function QRCodeScanner({ sessionId }: { sessionId: string }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const t = useTranslations('Admin');

  useEffect(() => {
    // Only initialize if not already scanning
    if (!isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true
        },
        false
      );

      const onScanSuccess = async (decodedText: string) => {
        // Pause scanning to prevent multiple rapid requests
        scannerRef.current?.pause(true);
        
        try {
          const res = await logAttendance(sessionId, decodedText);
          if (res.error) {
            toast.error(t('scanError'), {
              description: res.error,
            });
          } else if (res.success) {
            toast.success(t('scanSuccess'), {
              description: `Student: ${res.studentName}`
            });
            // Optional: Add audio beep here
          }
        } finally {
          // Resume scanning after 2 seconds
          setTimeout(() => {
            scannerRef.current?.resume();
          }, 2000);
        }
      };

      const onScanFailure = (error: any) => {
        // ignore scan failure, it happens every frame no QR is found
      };

      scannerRef.current.render(onScanSuccess, onScanFailure);
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        setIsScanning(false);
      }
    };
  }, [sessionId, toast, t]);

  return (
    <div className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border bg-card">
      <div id="qr-reader" className="w-full" />
    </div>
  );
}

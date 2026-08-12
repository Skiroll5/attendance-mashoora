'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { logAttendance, undoAttendance } from '@/lib/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function QRCodeScanner({ sessionId }: { sessionId: string }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [lastScanned, setLastScanned] = useState<{ studentId: string, name: string } | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  
  // Track recently scanned to avoid rapid duplicate requests
  const recentScansRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const t = useTranslations('Admin');

  const playBeep = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio beep blocked by browser policy:", e));
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
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
        if (recentScansRef.current.has(decodedText)) {
          return; // Ignore duplicate scan within the cooldown window
        }
        
        recentScansRef.current.add(decodedText);
        // Remove from recent scans after 3 seconds so they can scan again if needed
        setTimeout(() => {
          recentScansRef.current.delete(decodedText);
        }, 3000);
        
        try {
          const res = await logAttendance(sessionId, decodedText);
          if (res.error) {
            toast.error(t('scanError'), { description: res.error });
          } else if (res.success && res.studentName) {
            playBeep();
            
            // Show below scanner
            setLastScanned({ studentId: decodedText, name: res.studentName });
            
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setLastScanned(null);
            }, 5000); // keep it visible for 5 seconds
          }
        } catch (err) {
          console.error(err);
        }
      };

      const onScanFailure = (error: any) => {
        // ignore scan failure
      };

      scannerRef.current.render(onScanSuccess, onScanFailure);
      setIsScanning(true);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        setIsScanning(false);
      }
    };
  }, [sessionId, toast, t]);

  const handleUndo = async () => {
    if (!lastScanned) return;
    
    setIsUndoing(true);
    
    try {
      const res = await undoAttendance(sessionId, lastScanned.studentId);
      if (res.success) {
        toast.info("Attendance undone.", {
          description: `Removed ${lastScanned.name} from this session.`
        });
        setLastScanned(null);
      } else {
        toast.error("Failed to undo", { description: res.error });
      }
    } catch (e) {
      toast.error("Error undoing attendance");
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="rounded-xl overflow-hidden shadow-lg border border-primary/20 bg-card">
        <div id="qr-reader" className="w-full" />
      </div>

      {lastScanned && (
        <div className="rounded-xl shadow-lg border border-green-500/30 bg-green-500/10 p-6 text-center animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h3 className="text-sm text-green-700/80 font-medium uppercase tracking-wider">Recorded successfully</h3>
          <h2 className="text-3xl font-bold text-green-800 mt-1 font-serif">{lastScanned.name}</h2>
          
          <div className="mt-6 w-full">
            <Button 
              variant="destructive" 
              size="lg" 
              className="w-full shadow-sm" 
              onClick={handleUndo}
              disabled={isUndoing}
            >
              <RotateCcw className="mr-2 w-5 h-5" />
              {isUndoing ? "Undoing..." : "Undo Scan (Wrong Student?)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

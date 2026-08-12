'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { logAttendance, undoAttendance } from '@/lib/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw } from 'lucide-react';

// Play a short beep using Web Audio API
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    // Stop after 150ms
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 150);
  } catch (e) {
    console.error("Audio beep failed", e);
  }
};

export default function QRCodeScanner({ sessionId }: { sessionId: string }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // State for success overlay
  const [lastScanned, setLastScanned] = useState<{ studentId: string, name: string } | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
            // Resume quickly on error
            setTimeout(() => {
              scannerRef.current?.resume();
            }, 1500);
          } else if (res.success && res.studentName) {
            playBeep();
            toast.success(t('scanSuccess'), {
              description: `Student: ${res.studentName}`
            });
            
            // Show overlay
            setLastScanned({ studentId: decodedText, name: res.studentName });
            
            // Clear any existing timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            // Resume scanning and hide overlay after 4 seconds
            timeoutRef.current = setTimeout(() => {
              setLastScanned(null);
              scannerRef.current?.resume();
            }, 4000);
          }
        } catch (err) {
          console.error(err);
          setTimeout(() => {
            scannerRef.current?.resume();
          }, 1500);
        }
      };

      const onScanFailure = (error: any) => {
        // ignore scan failure, it happens every frame no QR is found
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    try {
      const res = await undoAttendance(sessionId, lastScanned.studentId);
      if (res.success) {
        toast.info("Attendance undone.", {
          description: `Removed ${lastScanned.name} from this session.`
        });
      } else {
        toast.error("Failed to undo", { description: res.error });
      }
    } catch (e) {
      toast.error("Error undoing attendance");
    } finally {
      setIsUndoing(false);
      setLastScanned(null);
      scannerRef.current?.resume();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border border-primary/20 bg-card relative">
      {lastScanned && (
        <div className="absolute inset-0 z-50 bg-primary/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-16 h-16 text-primary-foreground mb-4" />
          <h3 className="text-xl text-primary-foreground/80 font-medium">Recorded successfully</h3>
          <h2 className="text-4xl font-bold text-primary-foreground mt-2 font-serif">{lastScanned.name}</h2>
          
          <div className="mt-8 space-y-3 w-full">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20 hover:text-primary-foreground" 
              onClick={handleUndo}
              disabled={isUndoing}
            >
              <RotateCcw className="mr-2 w-5 h-5" />
              {isUndoing ? "Undoing..." : "Undo Scan (Wrong Student?)"}
            </Button>
            <p className="text-primary-foreground/60 text-sm">Resuming automatically...</p>
          </div>
        </div>
      )}
      
      <div id="qr-reader" className="w-full" />
    </div>
  );
}

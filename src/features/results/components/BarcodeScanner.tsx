import React, { useEffect, useRef, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonSpinner,
} from '@ionic/react';
import { closeOutline, cameraOutline } from 'ionicons/icons';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    mountedRef.current = true;

    const startScanner = async () => {
      try {
        setError('');

        // Create scanner instance
        const scanner = new Html5Qrcode('qr-reader', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        // Start scanning with back camera
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            console.log('Barcode detected:', decodedText, 'Format:', decodedResult.result.format);

            // Vibrate on success
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            // Stop and return result
            stopScanner();
            onScan(decodedText);
            onClose();
          },
          (errorMessage) => {
            // Scanning errors are normal and continuous, ignore them
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        console.error('Scanner start error:', err);

        let errorMsg = 'Kamera konnte nicht gestartet werden';
        if (err?.message?.includes('NotAllowedError') || err?.message?.includes('Permission')) {
          errorMsg = 'Kamera-Berechtigung wurde verweigert. Bitte in den App-Einstellungen erlauben.';
        } else if (err?.message?.includes('NotFoundError')) {
          errorMsg = 'Keine Kamera gefunden';
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        if (scanner.getState() === 2) { // SCANNING state
          await scanner.stop();
        }
        scanner.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleManualInput = () => {
    stopScanner();
    const barcode = prompt('Barcode manuell eingeben:');
    if (barcode) {
      onScan(barcode);
    }
    onClose();
  };

  const handleRetry = () => {
    setError('');
    setIsScanning(false);
    // Trigger re-initialization
    const restart = async () => {
      await stopScanner();
      // Small delay before restart
      setTimeout(() => {
        if (mountedRef.current && isOpen) {
          window.location.reload();
        }
      }, 100);
    };
    restart();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Barcode scannen</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={handleClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          backgroundColor: '#000',
          padding: '20px',
        }}>
          {!isScanning && !error && (
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <IonSpinner name="crescent" style={{ width: '48px', height: '48px' }} />
              <p style={{ marginTop: '16px' }}>Kamera wird gestartet...</p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
                Bitte Kamera-Zugriff erlauben
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', color: '#fff', maxWidth: '400px' }}>
              <IonIcon icon={cameraOutline} style={{ fontSize: '48px', marginBottom: '16px', color: '#ef4444' }} />
              <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
              <IonButton expand="block" onClick={handleRetry} style={{ marginBottom: '8px' }}>
                Erneut versuchen
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={handleManualInput}>
                Manuell eingeben
              </IonButton>
            </div>
          )}

          {/* Scanner container */}
          <div
            id="qr-reader"
            style={{
              width: '100%',
              maxWidth: '500px',
              display: isScanning ? 'block' : 'none',
            }}
          />

          {isScanning && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: '#fff', marginBottom: '8px', fontWeight: '600' }}>
                Barcode im Rahmen positionieren
              </p>
              <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
                Halte das Handy ruhig und warte 1-2 Sekunden
              </p>
              <IonButton fill="outline" color="light" onClick={handleManualInput}>
                Manuell eingeben
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

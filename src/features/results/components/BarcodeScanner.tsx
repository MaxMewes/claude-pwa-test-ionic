import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { logger } from '../../../shared/utils/logger';

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
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  // Stable callback for barcode scanning to prevent memory leaks
  const handleScanSuccess = useCallback((decodedText: string) => {
    if (!mountedRef.current) return;

    logger.debug('Barcode detected:', decodedText);

    // Vibrate on success
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Stop and return result
    stopScanner().then(() => {
      onScan(decodedText);
      onClose();
    });
  }, [onScan, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setError('');
      return;
    }

    mountedRef.current = true;

    const startScanner = async () => {
      try {
        setError('');
        setIsScanning(false);

        // Wait for DOM element to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if element exists
        const element = document.getElementById('qr-reader');
        if (!element) {
          throw new Error('Scanner element not found');
        }

        // Clear any existing scanner
        if (scannerRef.current) {
          await stopScanner();
        }

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
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Scanning errors are normal and continuous, ignore them
          }
        );

        if (mountedRef.current) {
          setIsScanning(true);
        }
      } catch (err) {
        if (!mountedRef.current) return;

        logger.error('Scanner start error:', err);

        let errorMsg = t('scanner.cameraNotStarted');
        if (err instanceof Error) {
          if (err.message?.includes('NotAllowedError') || err.message?.includes('Permission')) {
            errorMsg = t('scanner.permissionDenied');
          } else if (err.message?.includes('NotFoundError')) {
            errorMsg = t('scanner.noCamera');
          } else {
            errorMsg = err.message;
          }
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
  }, [isOpen, retryCount, handleScanSuccess, t]);

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
        logger.error('Error stopping scanner:', err);
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
    const barcode = prompt(t('scanner.manualInputPrompt'));
    if (barcode) {
      onScan(barcode);
    }
    onClose();
  };

  const handleRetry = async () => {
    setError('');
    setIsScanning(false);

    // Stop current scanner
    await stopScanner();

    // Trigger re-initialization by updating retry count
    setRetryCount(prev => prev + 1);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('scanner.title')}</IonTitle>
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
              <p style={{ marginTop: '16px' }}>{t('scanner.cameraStarting')}</p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
                {t('scanner.allowCameraAccess')}
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', color: '#fff', maxWidth: '400px' }}>
              <IonIcon icon={cameraOutline} style={{ fontSize: '48px', marginBottom: '16px', color: '#ef4444' }} />
              <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
              <IonButton expand="block" onClick={handleRetry} style={{ marginBottom: '8px' }}>
                {t('common.retry')}
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={handleManualInput}>
                {t('scanner.manualInput')}
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
                {t('scanner.positionBarcode')}
              </p>
              <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
                {t('scanner.holdSteady')}
              </p>
              <IonButton fill="outline" color="light" onClick={handleManualInput}>
                {t('scanner.manualInput')}
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

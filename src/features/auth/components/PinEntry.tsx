import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonGrid, IonRow, IonCol, IonIcon, IonText } from '@ionic/react';
import { backspaceOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PinEntryProps {
  length?: number;
  title: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  error?: string;
}

export const PinEntry: React.FC<PinEntryProps> = ({
  length = 4,
  title,
  subtitle,
  onComplete,
  error,
}) => {
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger haptic feedback (safely, only on native)
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch {
      // Silently fail on web
    }
  };

  useEffect(() => {
    if (error) {
      // Shake animation and haptic on error
      setIsShaking(true);
      triggerHaptic(ImpactStyle.Heavy);
      setTimeout(() => {
        setIsShaking(false);
        setPin(Array(length).fill(''));
        setActiveIndex(0);
      }, 500);
    }
  }, [error, length]);

  const handleNumberPress = (num: string) => {
    if (activeIndex >= length) return;

    // Trigger animation for this dot
    setAnimatingIndex(activeIndex);
    triggerHaptic(ImpactStyle.Light);
    setTimeout(() => setAnimatingIndex(null), 250);

    const newPin = [...pin];
    newPin[activeIndex] = num;
    setPin(newPin);

    if (activeIndex === length - 1) {
      // Success haptic on complete
      setTimeout(() => triggerHaptic(ImpactStyle.Medium), 100);
      onComplete(newPin.join(''));
    } else {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (activeIndex === 0 && pin[0] === '') return;

    triggerHaptic(ImpactStyle.Light);
    const newPin = [...pin];
    if (pin[activeIndex] !== '') {
      newPin[activeIndex] = '';
    } else if (activeIndex > 0) {
      newPin[activeIndex - 1] = '';
      setActiveIndex(activeIndex - 1);
    }
    setPin(newPin);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  return (
    <div ref={containerRef} style={{ padding: '24px', textAlign: 'center' }}>
      <IonText color="dark">
        <h2 style={{ margin: '0 0 8px 0' }}>{title}</h2>
      </IonText>
      {subtitle && (
        <IonText color="medium">
          <p style={{ margin: '0 0 32px 0' }}>{subtitle}</p>
        </IonText>
      )}

      {/* PIN Dots */}
      <div
        className={isShaking ? 'pin-shake' : ''}
        style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}
      >
        {pin.map((digit, index) => (
          <div
            key={index}
            className={animatingIndex === index ? 'pin-dot-animate' : ''}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: digit ? 'var(--ion-color-primary)' : 'transparent',
              border: '2px solid var(--ion-color-primary)',
              transition: 'background-color 0.15s ease, transform 0.15s ease',
              transform: digit ? 'scale(1)' : 'scale(0.9)',
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <IonText color="danger">
          <p style={{ marginBottom: '16px' }}>{error}</p>
        </IonText>
      )}

      {/* Number Pad */}
      <IonGrid style={{ maxWidth: '300px', margin: '0 auto' }}>
        {[0, 1, 2, 3].map((row) => (
          <IonRow key={row}>
            {numbers.slice(row * 3, row * 3 + 3).map((num, index) => (
              <IonCol key={index} size="4">
                {num === '' ? (
                  <div style={{ height: '64px' }} />
                ) : num === 'back' ? (
                  <IonButton
                    fill="clear"
                    expand="block"
                    className="pin-pad-button"
                    style={{ height: '64px', '--border-radius': '16px' } as React.CSSProperties}
                    onClick={handleBackspace}
                  >
                    <IonIcon icon={backspaceOutline} style={{ fontSize: '24px' }} />
                  </IonButton>
                ) : (
                  <IonButton
                    fill="clear"
                    expand="block"
                    className="pin-pad-button"
                    style={{ height: '64px', fontSize: '24px', '--border-radius': '16px' } as React.CSSProperties}
                    onClick={() => handleNumberPress(num)}
                  >
                    {num}
                  </IonButton>
                )}
              </IonCol>
            ))}
          </IonRow>
        ))}
      </IonGrid>
    </div>
  );
};

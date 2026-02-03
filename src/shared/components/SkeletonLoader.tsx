import React from 'react';
import { IonSkeletonText, IonItem, IonLabel, IonList, IonCard, IonCardContent } from '@ionic/react';

interface SkeletonLoaderProps {
  type: 'list' | 'card' | 'detail' | 'result';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 3 }) => {
  const renderListSkeleton = () => (
    <IonList>
      {Array.from({ length: count }).map((_, index) => (
        <IonItem key={index}>
          <IonLabel>
            <h2>
              <IonSkeletonText animated style={{ width: '60%' }} />
            </h2>
            <p>
              <IonSkeletonText animated style={{ width: '80%' }} />
            </p>
            <p>
              <IonSkeletonText animated style={{ width: '40%' }} />
            </p>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );

  const renderCardSkeleton = () => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <IonCard key={index}>
          <IonCardContent>
            <IonSkeletonText animated style={{ width: '70%', height: '24px', marginBottom: '8px' }} />
            <IonSkeletonText animated style={{ width: '100%' }} />
            <IonSkeletonText animated style={{ width: '90%' }} />
            <IonSkeletonText animated style={{ width: '50%' }} />
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );

  const renderDetailSkeleton = () => (
    <div style={{ padding: '16px' }}>
      <IonSkeletonText animated style={{ width: '80%', height: '32px', marginBottom: '16px' }} />
      <IonSkeletonText animated style={{ width: '60%', height: '20px', marginBottom: '24px' }} />

      <div style={{ marginBottom: '24px' }}>
        <IonSkeletonText animated style={{ width: '100%', marginBottom: '8px' }} />
        <IonSkeletonText animated style={{ width: '100%', marginBottom: '8px' }} />
        <IonSkeletonText animated style={{ width: '75%' }} />
      </div>

      <IonList>
        {Array.from({ length: 4 }).map((_, index) => (
          <IonItem key={index}>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '40%' }} />
              <IonSkeletonText animated style={{ width: '30%' }} />
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    </div>
  );

  // ResultCard-style skeleton matching the actual card layout
  const renderResultSkeleton = () => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '1px solid var(--ion-color-light-shade, #d7d8da)',
            backgroundColor: 'var(--ion-background-color)',
            minHeight: '76px',
            padding: '8px 0',
          }}
        >
          {/* Left indicator bar placeholder */}
          <div
            style={{
              width: '12px',
              minWidth: '12px',
              backgroundColor: index % 3 === 0 ? 'var(--ion-color-light-shade, #e0e0e0)' : 'transparent',
            }}
          />

          {/* Type letter placeholder */}
          <div
            style={{
              width: '28px',
              minWidth: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '4px',
            }}
          >
            <IonSkeletonText animated style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: '4px 12px 4px 8px' }}>
            {/* Row 1: Patient name (prominent) + Lab number + Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              {/* Patient Name - prominent bar */}
              <IonSkeletonText
                animated
                style={{
                  width: '45%',
                  height: '18px',
                  borderRadius: '4px',
                }}
              />
              {/* Right side: Lab number + Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonSkeletonText animated style={{ width: '60px', height: '14px', borderRadius: '3px' }} />
                <IonSkeletonText animated style={{ width: '75px', height: '14px', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Row 2: Geburtsdatum + Age + Laboratory */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Geburtsdatum (Date of Birth) - visible bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IonSkeletonText
                  animated
                  style={{
                    width: '80px',
                    height: '14px',
                    borderRadius: '3px',
                  }}
                />
                {/* Age */}
                <IonSkeletonText animated style={{ width: '35px', height: '14px', borderRadius: '3px' }} />
              </div>
              {/* Laboratory name */}
              <IonSkeletonText animated style={{ width: '90px', height: '12px', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  switch (type) {
    case 'list':
      return renderListSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    case 'result':
      return renderResultSkeleton();
    default:
      return renderListSkeleton();
  }
};

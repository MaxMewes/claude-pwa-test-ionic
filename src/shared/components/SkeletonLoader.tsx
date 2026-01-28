import React from 'react';
import { IonSkeletonText, IonItem, IonLabel, IonList, IonCard, IonCardContent } from '@ionic/react';

interface SkeletonLoaderProps {
  type: 'list' | 'card' | 'detail';
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

  switch (type) {
    case 'list':
      return renderListSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    default:
      return renderListSkeleton();
  }
};

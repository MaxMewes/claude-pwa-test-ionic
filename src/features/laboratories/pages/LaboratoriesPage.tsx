import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLaboratories } from '../hooks/useLaboratories';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';

export const LaboratoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const { data, isLoading, refetch } = useLaboratories();

  const handleLaboratoryClick = (labId: string | number) => {
    history.push(`/laboratories/${labId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('laboratories.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : !data?.Results?.length ? (
          <EmptyState type="laboratories" />
        ) : (
          <IonList lines="full">
            {data.Results.map((lab, index) => {
              const labId = lab.Id ?? lab.id ?? index;
              const labName = lab.Name ?? lab.name ?? 'Labor';

              return (
                <IonItem
                  key={labId}
                  button
                  onClick={() => handleLaboratoryClick(labId)}
                  style={{
                    '--background': index % 2 === 0 ? '#F4F4F4' : '#FFFFFF',
                  }}
                >
                  <IonLabel>
                    <h2
                      style={{
                        fontWeight: 500,
                        fontSize: '15px',
                        color: '#3C3C3B',
                        margin: 0,
                      }}
                    >
                      {labName}
                    </h2>
                  </IonLabel>
                  <IonIcon
                    icon={chevronForward}
                    slot="end"
                    style={{ color: '#646363', fontSize: '18px' }}
                  />
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

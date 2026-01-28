import React, { useState, useCallback } from 'react';
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
  IonText,
} from '@ionic/react';
import { locationOutline, timeOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLaboratories } from '../hooks/useLaboratories';
import { SearchInput, PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { Laboratory } from '../../../api/types';

export const LaboratoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useLaboratories({ search: search || undefined });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleLaboratoryClick = (labId: string) => {
    history.push(`/laboratories/${labId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const isOpenNow = (lab: Laboratory): boolean => {
    const now = new Date();
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const today = dayNames[now.getDay()];
    const todayHours = lab.openingHours.find((h) => h.day === today);

    if (!todayHours || todayHours.isClosed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('laboratories.title')}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <SearchInput onSearch={handleSearch} placeholder="Labor suchen..." />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : !data?.Items?.length ? (
          <EmptyState
            type={search ? 'search' : 'laboratories'}
            actionLabel={search ? t('common.reset') : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        ) : (
          <IonList>
            {data.Items.map((lab) => {
              const isOpen = isOpenNow(lab);
              return (
                <IonItem
                  key={lab.id}
                  button
                  onClick={() => handleLaboratoryClick(lab.id)}
                  detail
                >
                  <IonLabel>
                    <h2 style={{ fontWeight: 500 }}>{lab.name}</h2>
                    <p>
                      <IonIcon
                        icon={locationOutline}
                        style={{ verticalAlign: 'middle', marginRight: '4px' }}
                      />
                      {lab.address.city}
                    </p>
                    <p>
                      <IonIcon
                        icon={timeOutline}
                        style={{ verticalAlign: 'middle', marginRight: '4px' }}
                      />
                      {lab.openingHours.find((h) => !h.isClosed)?.open} -{' '}
                      {lab.openingHours.find((h) => !h.isClosed)?.close} Uhr
                    </p>
                  </IonLabel>

                  <div slot="end" style={{ textAlign: 'right' }}>
                    <IonIcon
                      icon={isOpen ? checkmarkCircle : closeCircle}
                      color={isOpen ? 'success' : 'medium'}
                      style={{ fontSize: '20px' }}
                    />
                    <IonText
                      color={isOpen ? 'success' : 'medium'}
                      style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}
                    >
                      {isOpen ? 'Geoeffnet' : t('laboratories.closed')}
                    </IonText>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

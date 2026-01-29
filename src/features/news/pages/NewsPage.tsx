import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonText,
} from '@ionic/react';
import { pinOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNews } from '../hooks/useNews';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';

export const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const { data, isLoading, refetch } = useNews();

  const handleNewsClick = (newsId: string) => {
    history.push(`/news/${newsId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('news.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !data?.Results?.length ? (
          <EmptyState type="news" />
        ) : (
          <div style={{ padding: '8px' }}>
            {data.Results.map((article) => (
              <IonCard
                key={article.id}
                onClick={() => handleNewsClick(article.id)}
                style={{
                  cursor: 'pointer',
                  opacity: article.isRead ? 0.85 : 1,
                }}
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                )}
                <IonCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <IonCardTitle
                      style={{
                        fontSize: '18px',
                        fontWeight: article.isRead ? 'normal' : 'bold',
                        flex: 1,
                      }}
                    >
                      {article.title}
                    </IonCardTitle>
                    {article.isPinned && (
                      <IonIcon icon={pinOutline} color="primary" style={{ fontSize: '20px' }} />
                    )}
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonText color="medium">
                    <p style={{ margin: '0 0 12px 0' }}>{article.summary}</p>
                  </IonText>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <IonText color="medium">
                      <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {format(new Date(article.publishedAt), 'dd.MM.yyyy', { locale: de })}
                    </IonText>
                    <IonText color="medium">{article.author}</IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

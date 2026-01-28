import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonText,
  IonBadge,
} from '@ionic/react';
import { pinOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNews } from '../hooks/useNews';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { NewsCategory } from '../../../api/types';

const categoryColors: Record<NewsCategory, string> = {
  announcement: 'primary',
  health_tip: 'success',
  laboratory_news: 'secondary',
  app_update: 'tertiary',
};

export const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [category, setCategory] = useState<NewsCategory | 'all'>('all');

  const { data, isLoading, refetch } = useNews(
    category === 'all' ? undefined : { category }
  );

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
        <IonToolbar>
          <IonSegment
            value={category}
            onIonChange={(e) => setCategory(e.detail.value as NewsCategory | 'all')}
            scrollable
          >
            <IonSegmentButton value="all">
              <IonLabel>Alle</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="announcement">
              <IonLabel>{t('news.category.announcement')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="health_tip">
              <IonLabel>{t('news.category.health_tip')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="laboratory_news">
              <IonLabel>{t('news.category.laboratory_news')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="app_update">
              <IonLabel>{t('news.category.app_update')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !data?.data.length ? (
          <EmptyState type="news" />
        ) : (
          <div style={{ padding: '8px' }}>
            {data.data.map((article) => (
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
                    <div style={{ flex: 1 }}>
                      <IonCardSubtitle>
                        <IonBadge color={categoryColors[article.category]}>
                          {t(`news.category.${article.category}`)}
                        </IonBadge>
                      </IonCardSubtitle>
                      <IonCardTitle
                        style={{
                          fontSize: '18px',
                          fontWeight: article.isRead ? 'normal' : 'bold',
                          marginTop: '8px',
                        }}
                      >
                        {article.title}
                      </IonCardTitle>
                    </div>
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

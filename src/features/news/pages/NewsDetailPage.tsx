import React, { useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonText,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { timeOutline, personOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNewsArticle, useMarkNewsAsRead } from '../hooks/useNews';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';
import { NewsCategory } from '../../../api/types';

const categoryColors: Record<NewsCategory, string> = {
  announcement: 'primary',
  health_tip: 'success',
  laboratory_news: 'secondary',
  app_update: 'tertiary',
};

export const NewsDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useNewsArticle(id);
  const markAsRead = useMarkNewsAsRead();

  // Mark as read when viewing
  useEffect(() => {
    if (article && !article.isRead) {
      markAsRead.mutate(article.id);
    }
  }, [article?.id]);

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.NEWS} />
            </IonButtons>
            <IonTitle>{t('news.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (!article) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.NEWS} />
            </IonButtons>
            <IonTitle>{t('news.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">Artikel nicht gefunden</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.NEWS} />
          </IonButtons>
          <IonTitle>{t('news.detail')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Hero Image */}
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        )}

        <div style={{ padding: '16px' }}>
          {/* Category Badge */}
          <IonBadge color={categoryColors[article.category]} style={{ marginBottom: '12px' }}>
            {t(`news.category.${article.category}`)}
          </IonBadge>

          {/* Title */}
          <IonText color="dark">
            <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', lineHeight: 1.3 }}>
              {article.title}
            </h1>
          </IonText>

          {/* Meta Info */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            <IonText color="medium">
              <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {format(new Date(article.publishedAt), 'dd. MMMM yyyy', { locale: de })}
            </IonText>
            <IonText color="medium">
              <IonIcon icon={personOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {article.author}
            </IonText>
          </div>

          {/* Summary */}
          <IonText color="dark">
            <p style={{ fontSize: '18px', lineHeight: 1.6, fontWeight: 500, marginBottom: '24px' }}>
              {article.summary}
            </p>
          </IonText>

          {/* Content */}
          <div
            style={{ fontSize: '16px', lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

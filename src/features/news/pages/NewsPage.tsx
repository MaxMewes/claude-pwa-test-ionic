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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import { pinOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useNews } from '../hooks/useNews';
import { parseColorMarkup } from '../../../shared/utils/colorMarkupParser';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import defaultNewsImage from '../../../assets/images/default-news.png';

export const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNews();

  // Flatten paginated results
  const allNews = data?.pages?.flatMap((page) => page.Results) || [];

  // Handle infinite scroll
  const handleLoadMore = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

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
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="ion-text-center">{t('news.title')}</IonTitle>
          <IonButtons slot="end" style={{ visibility: 'hidden' }}>
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !allNews.length ? (
          <EmptyState type="news" />
        ) : (
          <>
            <div style={{ padding: '8px' }}>
              {allNews.map((article) => {
                // Support both API v3 (PascalCase) and legacy (camelCase) fields
                const articleId = article.Id ?? article.id;
                const articleTitle = article.Title ?? article.title ?? '';
                const articleTeaser = article.Teaser ?? article.summary ?? '';
                const articleCreated = article.Created ?? article.publishedAt ?? '';
                const articleAuthor = article.CreatedBy?.Fullname ?? article.CreatedBy?.Name ?? article.author ?? '';
                const articleImage = article.ImageUrl ?? article.imageUrl ?? defaultNewsImage;
                const isImportant = article.Importance === 'High' || article.isPinned;

                return (
                  <IonCard
                    key={articleId}
                    onClick={() => handleNewsClick(String(articleId))}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={articleImage}
                      alt={articleTitle}
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                    <IonCardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <IonCardTitle
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            flex: 1,
                          }}
                        >
                          {articleTitle}
                        </IonCardTitle>
                        {isImportant && (
                          <IonIcon icon={pinOutline} color="primary" style={{ fontSize: '20px' }} />
                        )}
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {articleTeaser && (
                        <div style={{ margin: '0 0 12px 0', color: 'var(--ion-color-medium)' }}>
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {parseColorMarkup(articleTeaser)}
                          </ReactMarkdown>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <IonText color="medium">
                          <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {articleCreated ? format(new Date(articleCreated), 'dd.MM.yyyy', { locale: de }) : ''}
                        </IonText>
                        {articleAuthor && <IonText color="medium">{articleAuthor}</IonText>}
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
            <IonInfiniteScroll
              onIonInfinite={handleLoadMore}
              threshold="100px"
              disabled={!hasNextPage || isFetchingNextPage}
            >
              <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText={t('common.loadingMore')} />
            </IonInfiniteScroll>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

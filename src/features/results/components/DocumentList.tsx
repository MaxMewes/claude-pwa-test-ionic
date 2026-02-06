import React from 'react';
import { IonText, IonIcon, IonSpinner, IonButton, useIonToast } from '@ionic/react';
import { documentOutline, downloadOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ResultDocument } from '../../../api/types';
import { useResultDocuments, useDownloadDocument } from '../hooks/useResults';

interface DocumentListProps {
  resultId: number | string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ resultId }) => {
  const { t } = useTranslation();
  const { data: documents, isLoading, error } = useResultDocuments(resultId);
  const { downloadDocument, isDownloading } = useDownloadDocument();
  const [presentToast] = useIonToast();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 16px' }}>
        <IonSpinner name="crescent" />
        <IonText color="medium" style={{ marginTop: '16px' }}>
          {t('documents.loading')}
        </IonText>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <IonText color="danger">{t('documents.errorLoading')}</IonText>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <IonText color="medium">{t('documents.noDocuments')}</IonText>
      </div>
    );
  }

  const handleDownload = async (doc: ResultDocument) => {
    if (!doc.IsFileAvailable) return;
    const fileName = `${doc.Title}.${doc.Extension}`;
    try {
      await downloadDocument(resultId, doc.Id, fileName);
    } catch {
      presentToast({
        message: t('documents.downloadError'),
        duration: 3000,
        color: 'danger',
      });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--labgate-surface)' }}>
      {documents.map((doc, index) => (
        <div
          key={doc.Id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: index % 2 === 0 ? 'var(--labgate-row-even)' : 'var(--labgate-row-odd)',
            borderBottom: '1px solid var(--labgate-border)',
            gap: '12px',
          }}
        >
          <IonIcon
            icon={documentOutline}
            style={{ fontSize: '24px', color: 'var(--labgate-brand)', flexShrink: 0 }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '15px', fontWeight: 500,
              color: 'var(--labgate-text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {doc.Title}
            </div>
            {doc.Description && (
              <div style={{
                fontSize: '12px', color: 'var(--labgate-text-muted)',
                marginTop: '2px',
              }}>
                {doc.Description}
              </div>
            )}
            <div style={{
              fontSize: '11px', color: 'var(--labgate-text-muted)',
              marginTop: '4px',
            }}>
              {doc.Extension.toUpperCase()}
              {doc.DocumentCreated && ` · ${new Date(doc.DocumentCreated).toLocaleDateString('de')}`}
            </div>
          </div>

          <IonButton
            fill="clear"
            size="small"
            onClick={() => handleDownload(doc)}
            disabled={!doc.IsFileAvailable || isDownloading === doc.Id}
            aria-label={t('documents.download')}
          >
            {isDownloading === doc.Id ? (
              <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
            ) : (
              <IonIcon icon={downloadOutline} />
            )}
          </IonButton>
        </div>
      ))}
    </div>
  );
};

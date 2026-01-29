import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonText,
  IonSearchbar,
} from '@ionic/react';
import {
  informationCircleOutline,
  listOutline,
  peopleOutline,
  callOutline,
  mailOutline,
  globeOutline,
  locationOutline,
  chevronForward,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLaboratory, useServiceCatalog, ServiceCatalogItem, LaboratoryContactPerson } from '../hooks/useLaboratories';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

type TabType = 'info' | 'services' | 'contacts';

// Colors matching old app
const COLORS = {
  brand: '#70CC60',
  text: '#3C3C3B',
  textLight: '#646363',
  rowEven: '#F4F4F4',
  rowOdd: '#FFFFFF',
  border: '#E5E5E5',
};

export const LaboratoryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: lab, isLoading } = useLaboratory(id);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [searchText, setSearchText] = useState('');

  const { data: services, isLoading: servicesLoading } = useServiceCatalog(
    id,
    activeTab === 'services' ? searchText : undefined
  );

  // Group services alphabetically
  const groupedServices = useMemo(() => {
    if (!services) return {};

    const groups: Record<string, ServiceCatalogItem[]> = {};
    const sortedServices = [...services].sort((a, b) => a.Name.localeCompare(b.Name));

    for (const service of sortedServices) {
      const firstLetter = service.Name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(service);
    }

    return groups;
  }, [services]);

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.LABORATORIES} />
            </IonButtons>
            <IonTitle>{t('laboratories.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (!lab) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.LABORATORIES} />
            </IonButtons>
            <IonTitle>{t('laboratories.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">Labor nicht gefunden</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const labName = lab.Name ?? lab.name ?? 'Labor';
  const labPhone = lab.Contact?.Phone ?? lab.Phone ?? lab.phone ?? '';
  const labFax = lab.Contact?.Fax ?? lab.fax ?? '';
  const labEmail = lab.Contact?.Email ?? lab.Email ?? lab.email ?? '';
  const labWebsite = lab.Contact?.Website ?? lab.Website ?? lab.website ?? '';
  const labAddress = lab.Address ?? lab.address;
  const labContacts = (lab.ContactPersons ?? []) as LaboratoryContactPerson[];

  const addressString = labAddress
    ? `${labAddress.Street ?? labAddress.street ?? ''} ${labAddress.Number ?? labAddress.HouseNumber ?? ''}, ${labAddress.Zip ?? labAddress.postalCode ?? ''} ${labAddress.City ?? labAddress.city ?? ''}`
    : '';

  const handlePhoneClick = () => {
    if (labPhone) window.open(`tel:${labPhone}`, '_self');
  };

  const handleEmailClick = () => {
    if (labEmail) window.open(`mailto:${labEmail}`, '_self');
  };

  const handleWebsiteClick = () => {
    if (labWebsite) {
      const url = labWebsite.startsWith('http') ? labWebsite : `https://${labWebsite}`;
      window.open(url, '_blank');
    }
  };

  const handleAddressClick = () => {
    if (addressString) {
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(addressString)}`, '_blank');
    }
  };

  // Information Tab Content
  const renderInfoTab = () => (
    <div>
      {/* Branded Header */}
      <div
        style={{
          padding: '20px 16px',
          backgroundColor: COLORS.brand,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: COLORS.brand,
          }}
        >
          {labName.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, color: '#FFFFFF' }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{labName}</div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ backgroundColor: '#FFFFFF' }}>
        {labPhone && (
          <div
            onClick={handlePhoneClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={callOutline} style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Telefon</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>{labPhone}</div>
            </div>
          </div>
        )}

        {labFax && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <IonIcon icon={callOutline} style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Fax</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>{labFax}</div>
            </div>
          </div>
        )}

        {labEmail && (
          <div
            onClick={handleEmailClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={mailOutline} style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>E-Mail</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>{labEmail}</div>
            </div>
          </div>
        )}

        {labWebsite && (
          <div
            onClick={handleWebsiteClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={globeOutline} style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Website</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>{labWebsite}</div>
            </div>
          </div>
        )}

        {addressString && (
          <div
            onClick={handleAddressClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={locationOutline} style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Adresse</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>{addressString}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Services Tab Content (Leistungsverzeichnis)
  const renderServicesTab = () => (
    <div>
      {/* Branded Header */}
      <div
        style={{
          padding: '16px',
          backgroundColor: COLORS.brand,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.brand,
          }}
        >
          {labName.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, color: '#FFFFFF', fontSize: '15px', fontWeight: 500 }}>
          {labName}
        </div>
      </div>

      {/* Search Bar */}
      <IonSearchbar
        value={searchText}
        onIonInput={(e) => setSearchText(e.detail.value || '')}
        placeholder="Leistung suchen..."
        style={{ '--background': '#F4F4F4' }}
      />

      {/* Services List */}
      {servicesLoading ? (
        <SkeletonLoader type="list" count={10} />
      ) : !services?.length ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.textLight }}>
          {searchText ? 'Keine Leistungen gefunden' : 'Keine Leistungen verfügbar'}
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF' }}>
          {Object.entries(groupedServices).map(([letter, items]) => (
            <div key={letter}>
              {/* Group Header */}
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FAFAFA',
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                {letter}
              </div>

              {/* Group Items */}
              {items.map((service, index) => (
                <div
                  key={service.Id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '15px',
                        color: COLORS.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {service.Name}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight, marginTop: '2px' }}>
                      {service.Ident}
                    </div>
                  </div>
                  <IonIcon icon={chevronForward} style={{ color: COLORS.textLight, fontSize: '18px' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Contacts Tab Content
  const renderContactsTab = () => (
    <div>
      {/* Branded Header */}
      <div
        style={{
          padding: '16px',
          backgroundColor: COLORS.brand,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.brand,
          }}
        >
          {labName.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, color: '#FFFFFF', fontSize: '15px', fontWeight: 500 }}>
          {labName}
        </div>
      </div>

      {/* Contacts List */}
      {!labContacts.length ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.textLight }}>
          Keine Ansprechpartner verfügbar
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF' }}>
          {labContacts.map((contact: LaboratoryContactPerson, index: number) => (
            <div
              key={contact.Id || index}
              style={{
                padding: '16px',
                backgroundColor: index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              {/* Name */}
              <div style={{ fontSize: '15px', fontWeight: 600, color: COLORS.text }}>
                {contact.Fullname || `${contact.Firstname || ''} ${contact.Name || ''}`.trim() || 'Ansprechpartner'}
              </div>

              {/* Position */}
              {contact.Position && (
                <div style={{ fontSize: '13px', color: COLORS.textLight, marginTop: '4px' }}>
                  {contact.Position}
                </div>
              )}

              {/* Phone */}
              {contact.Contact?.Phone && (
                <div
                  onClick={() => window.open(`tel:${contact.Contact!.Phone}`, '_self')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={callOutline} style={{ fontSize: '16px', color: COLORS.brand, marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: COLORS.text }}>{contact.Contact.Phone}</span>
                </div>
              )}

              {/* Email */}
              {contact.Contact?.Email && (
                <div
                  onClick={() => window.open(`mailto:${contact.Contact!.Email}`, '_self')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <IonIcon icon={mailOutline} style={{ fontSize: '16px', color: COLORS.brand, marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: COLORS.text }}>{contact.Contact.Email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.LABORATORIES} />
          </IonButtons>
          <IonTitle>{labName}</IonTitle>
        </IonToolbar>

        {/* Tab Segment */}
        <IonToolbar>
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as TabType)}>
            <IonSegmentButton value="info">
              <IonIcon icon={informationCircleOutline} />
              <IonLabel>Info</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="services">
              <IonIcon icon={listOutline} />
              <IonLabel>Leistungen</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="contacts">
              <IonIcon icon={peopleOutline} />
              <IonLabel>Kontakte</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'contacts' && renderContactsTab()}
      </IonContent>
    </IonPage>
  );
};

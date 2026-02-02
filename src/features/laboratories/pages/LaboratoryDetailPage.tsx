import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonIcon,
  IonText,
  IonSearchbar,
  IonButton,
  IonFooter,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
} from '@ionic/react';
import {
  informationCircleOutline,
  listOutline,
  peopleOutline,
  callOutline,
  mailOutline,
  globeOutline,
  locationOutline,
  searchOutline,
  closeOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import noContactsImage from '../../../assets/images/no-contacts-indicator-undraw-people.svg';
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
  const history = useHistory();
  const { data: lab, isLoading } = useLaboratory(id);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const handleServiceClick = (serviceId: number) => {
    history.push(`/laboratories/${id}/services/${serviceId}`);
  };

  // Focus searchbar when opening
  useEffect(() => {
    if (isSearchOpen && searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.setFocus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Close search when switching tabs
  useEffect(() => {
    if (activeTab !== 'services') {
      setIsSearchOpen(false);
      setSearchText('');
    }
  }, [activeTab]);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchText('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

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

  // Auto-expand all accordions when searching
  useEffect(() => {
    if (searchText && Object.keys(groupedServices).length > 0) {
      setOpenAccordions(Object.keys(groupedServices));
    }
  }, [searchText, groupedServices]);

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

      {/* Services List */}
      {servicesLoading ? (
        <SkeletonLoader type="list" count={10} />
      ) : !services?.length ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.textLight }}>
          {searchText ? 'Keine Leistungen gefunden' : 'Keine Leistungen verfügbar'}
        </div>
      ) : (
        <IonAccordionGroup
          multiple={true}
          value={openAccordions}
          onIonChange={(e) => setOpenAccordions(e.detail.value as string[])}
        >
          {Object.entries(groupedServices).map(([letter, items]) => (
            <IonAccordion key={letter} value={letter}>
              <IonItem slot="header" color="light">
                <IonLabel>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {letter}
                  </h2>
                  <p style={{ fontSize: '12px', color: COLORS.textLight, margin: '4px 0 0 0' }}>
                    {items.length} {items.length === 1 ? 'Leistung' : 'Leistungen'}
                  </p>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ backgroundColor: '#FFFFFF' }}>
                {items.map((service, index) => (
                  <div
                    key={service.Id}
                    onClick={() => handleServiceClick(service.Id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
                      borderBottom: `1px solid ${COLORS.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '15px',
                          color: COLORS.text,
                        }}
                      >
                        {service.Name}
                      </div>
                      <div style={{ fontSize: '12px', color: COLORS.textLight, marginTop: '2px' }}>
                        {service.Ident}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
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
        <div style={{ padding: '40px 16px', textAlign: 'center' }}>
          <img
            src={noContactsImage}
            alt=""
            style={{ width: '200px', maxWidth: '80%', height: 'auto', marginBottom: '16px', opacity: 0.85 }}
          />
          <div style={{ color: COLORS.textLight }}>Keine Ansprechpartner verfügbar</div>
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
          {isSearchOpen ? (
            <>
              <IonSearchbar
                ref={searchbarRef}
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value || '')}
                placeholder="Leistung suchen..."
                animated
                showCancelButton="never"
                style={{ '--background': 'var(--labgate-selected-bg)' }}
              />
              <IonButtons slot="end">
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            <>
              <IonTitle>{labName}</IonTitle>
              {activeTab === 'services' && (
                <IonButtons slot="end">
                  <IonButton onClick={handleSearchToggle}>
                    <IonIcon icon={searchOutline} />
                  </IonButton>
                </IonButtons>
              )}
            </>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'contacts' && renderContactsTab()}
      </IonContent>

      <IonFooter>
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid var(--labgate-border)',
            backgroundColor: 'var(--ion-background-color)',
          }}
        >
          {[
            { key: 'info' as TabType, label: 'Informationen', icon: informationCircleOutline },
            { key: 'services' as TabType, label: 'LV', icon: listOutline },
            { key: 'contacts' as TabType, label: 'Kontakte', icon: peopleOutline },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--labgate-brand)' : 'var(--labgate-text-muted)',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IonIcon
                  icon={tab.icon}
                  style={{
                    fontSize: '22px',
                  }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </IonFooter>
    </IonPage>
  );
};

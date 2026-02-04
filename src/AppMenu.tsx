import React from 'react';
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonMenuToggle,
  IonAccordionGroup,
  IonAccordion,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {
  statsChartOutline,
  peopleOutline,
  flaskOutline,
  newspaperOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useAuthStore } from './features/auth/store/authStore';
import { useSettingsStore, ResultPeriodFilter } from './shared/store/useSettingsStore';
import { ROUTES } from './config/routes';
import styles from './AppMenu.module.css';

export const AppMenu: React.FC = () => {
  const { logout } = useAuthStore();
  const { resultsPeriod, setResultsPeriod } = useSettingsStore();

  const resultsSubItems: { title: string; period: ResultPeriodFilter }[] = [
    { title: 'Heute', period: 'today' },
    { title: 'Letzten 7 Tage', period: '7days' },
    { title: 'Letzten 30 Tage', period: '30days' },
    { title: 'Alle', period: 'all' },
    { title: 'Archiv', period: 'archive' },
  ];

  const handlePeriodSelect = (period: ResultPeriodFilter) => {
    setResultsPeriod(period);
  };

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonContent>
        <IonList lines="full" className={styles.menuList}>
          {/* Meine Befunde - Expandable (default open) */}
          <IonAccordionGroup value="results">
            <IonAccordion value="results">
              <IonItem slot="header" lines="full">
                <IonIcon slot="start" icon={statsChartOutline} className={styles.menuIcon} />
                <IonLabel className={styles.menuLabel}>Meine Befunde</IonLabel>
              </IonItem>
              <div slot="content">
                {resultsSubItems.map((item, index) => (
                  <IonMenuToggle key={index} autoHide={false}>
                    <IonItem
                      button
                      routerLink={ROUTES.RESULTS}
                      routerDirection="root"
                      lines="none"
                      className={`${styles.subMenuItem} ${resultsPeriod === item.period ? styles.selectedItem : ''}`}
                      onClick={() => handlePeriodSelect(item.period)}
                    >
                      <IonLabel className={resultsPeriod === item.period ? styles.selectedLabel : ''}>
                        {item.title}
                      </IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                ))}
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Meine Patienten */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.PATIENTS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={peopleOutline} className={styles.menuIcon} />
              <IonLabel>Meine Patienten</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Meine Labore */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.LABORATORIES} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={flaskOutline} className={styles.menuIcon} />
              <IonLabel>Meine Labore</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* News */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.NEWS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={newspaperOutline} className={styles.menuIcon} />
              <IonLabel>News</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Einstellungen */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.SETTINGS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={settingsOutline} className={styles.menuIcon} />
              <IonLabel>Einstellungen</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Hilfe - Expandable */}
          <IonAccordionGroup>
            <IonAccordion value="help">
              <IonItem slot="header" lines="full">
                <IonIcon slot="start" icon={helpCircleOutline} className={styles.menuIcon} />
                <IonLabel>Hilfe</IonLabel>
              </IonItem>
              <div slot="content">
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.HELP_ABOUT}
                    routerDirection="root"
                    lines="none"
                    className={styles.subMenuItem}
                  >
                    <IonLabel>Über</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.SETTINGS_FAQ}
                    routerDirection="root"
                    lines="none"
                    className={styles.subMenuItem}
                  >
                    <IonLabel>FAQ</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.SETTINGS_PRIVACY}
                    routerDirection="root"
                    lines="none"
                    className={styles.subMenuItem}
                  >
                    <IonLabel>Datenschutz</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Abmelden */}
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={logout} lines="full">
              <IonIcon slot="start" icon={logOutOutline} className={styles.menuIcon} />
              <IonLabel>Abmelden</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

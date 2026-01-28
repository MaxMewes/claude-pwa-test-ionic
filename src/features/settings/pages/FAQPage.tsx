import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../config/routes';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Wie erhalte ich Zugang zur labGate App?',
    answer:
      'Sie erhalten Ihre Zugangsdaten von Ihrem behandelnden Arzt oder Labor. Die Registrierung erfolgt ueber die Praxis oder das Labor, mit dem Sie verbunden sind.',
  },
  {
    question: 'Wie sicher sind meine Gesundheitsdaten?',
    answer:
      'Alle Daten werden mit modernster Verschluesselung (TLS 1.3) uebertragen und gespeichert. Wir erfuellen alle Anforderungen der DSGVO und des Patientendatenschutzgesetzes. Ihre Daten werden ausschliesslich in Deutschland gespeichert.',
  },
  {
    question: 'Was bedeuten die farbigen Markierungen bei meinen Laborwerten?',
    answer:
      'Gruen bedeutet, dass der Wert im Normalbereich liegt. Gelb/Orange zeigt an, dass der Wert leicht vom Normalbereich abweicht. Rot markiert kritische Werte, die aerztliche Aufmerksamkeit erfordern.',
  },
  {
    question: 'Wie kann ich meine Befunde herunterladen?',
    answer:
      'Oeffnen Sie den gewuenschten Befund und tippen Sie auf das PDF-Symbol in der oberen rechten Ecke. Der Befund wird als PDF heruntergeladen und kann gespeichert oder geteilt werden.',
  },
  {
    question: 'Warum sehe ich manche Befunde nicht sofort?',
    answer:
      'Laborergebnisse muessen von Ihrem Arzt oder dem Labor freigegeben werden, bevor sie in der App erscheinen. Kritische Werte werden Ihrem Arzt zuerst mitgeteilt, damit er Sie kontaktieren kann.',
  },
  {
    question: 'Wie aktiviere ich die biometrische Anmeldung?',
    answer:
      'Gehen Sie zu Einstellungen > Biometrische Sicherheit und aktivieren Sie die Option. Bei der naechsten Anmeldung koennen Sie Fingerabdruck oder Face ID verwenden.',
  },
  {
    question: 'Was passiert, wenn ich mein Passwort vergessen habe?',
    answer:
      'Tippen Sie auf der Anmeldeseite auf "Passwort vergessen". Sie erhalten eine E-Mail mit einem Link zum Zuruecksetzen Ihres Passworts. Alternativ kontaktieren Sie Ihren Arzt oder das Labor.',
  },
  {
    question: 'Kann ich die App auch offline nutzen?',
    answer:
      'Ja, bereits geladene Befunde sind auch ohne Internetverbindung verfuegbar. Neue Befunde werden automatisch synchronisiert, sobald Sie wieder online sind.',
  },
  {
    question: 'Wie kontaktiere ich den Support?',
    answer:
      'Sie erreichen unseren Support per E-Mail unter support@labgate.de oder telefonisch unter der Nummer +49 30 12345678 (Mo-Fr 9-17 Uhr).',
  },
];

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SETTINGS} />
          </IonButtons>
          <IonTitle>{t('settings.support.faq')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonAccordionGroup>
          {faqItems.map((item, index) => (
            <IonAccordion key={index} value={`faq-${index}`}>
              <IonItem slot="header" color="light">
                <IonLabel style={{ whiteSpace: 'normal' }}>{item.question}</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <p style={{ margin: 0, lineHeight: 1.6 }}>{item.answer}</p>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

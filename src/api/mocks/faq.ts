import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FAQ, PaginatedResponse } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockFAQData: FAQ[] = [
  {
    id: 'faq-001',
    question: 'Wie kann ich meine Laborbefunde einsehen?',
    answer: 'Nach der Anmeldung gelangen Sie automatisch zur Befunduebersicht. Dort sehen Sie alle Ihre aktuellen Laborbefunde. Tippen Sie auf einen Befund, um die Details einzusehen.',
    category: 'Befunde',
    order: 1,
  },
  {
    id: 'faq-002',
    question: 'Was bedeuten die farbigen Markierungen bei den Werten?',
    answer: 'Gruen = Wert im Normalbereich\nGelb/Orange = Wert leicht erhoehht oder erniedrigt\nRot = Kritischer Wert, der aerztliche Aufmerksamkeit erfordert\n\nBitte besprechen Sie auffaellige Werte immer mit Ihrem Arzt.',
    category: 'Befunde',
    order: 2,
  },
  {
    id: 'faq-003',
    question: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?',
    answer: 'Gehen Sie zu Einstellungen > Sicherheit > Zwei-Faktor-Authentifizierung. Folgen Sie den Anweisungen, um eine Authenticator-App einzurichten oder SMS-Verifizierung zu aktivieren.',
    category: 'Sicherheit',
    order: 3,
  },
  {
    id: 'faq-004',
    question: 'Kann ich die App offline nutzen?',
    answer: 'Ja, bereits geladene Befunde sind auch offline verfuegbar. Neue Befunde koennen jedoch nur mit Internetverbindung abgerufen werden. Die App synchronisiert automatisch, sobald wieder eine Verbindung besteht.',
    category: 'Allgemein',
    order: 4,
  },
  {
    id: 'faq-005',
    question: 'Wie kann ich mein Passwort aendern?',
    answer: 'Gehen Sie zu Einstellungen > Konto > Passwort aendern. Geben Sie Ihr aktuelles Passwort ein und waehlen Sie ein neues, sicheres Passwort. Das neue Passwort muss mindestens 8 Zeichen lang sein und Gross-/Kleinbuchstaben sowie Zahlen enthalten.',
    category: 'Konto',
    order: 5,
  },
  {
    id: 'faq-006',
    question: 'Wie kann ich Benachrichtigungen einstellen?',
    answer: 'Unter Einstellungen > Benachrichtigungen koennen Sie festlegen, wann und wie Sie ueber neue Befunde informiert werden moechten. Sie koennen Push-Benachrichtigungen, E-Mail-Benachrichtigungen und Erinnerungen individuell aktivieren oder deaktivieren.',
    category: 'Einstellungen',
    order: 6,
  },
  {
    id: 'faq-007',
    question: 'Wer hat Zugriff auf meine Daten?',
    answer: 'Ihre Gesundheitsdaten sind streng vertraulich. Nur Sie und die von Ihnen autorisierten Aerzte haben Zugriff. Alle Daten werden verschluesselt uebertragen und gespeichert. Wir entsprechen allen Anforderungen der DSGVO und des Patientendatenschutzgesetzes.',
    category: 'Datenschutz',
    order: 7,
  },
  {
    id: 'faq-008',
    question: 'Wie kann ich einen Befund als PDF exportieren?',
    answer: 'Oeffnen Sie den gewuenschten Befund und tippen Sie auf das PDF-Symbol oben rechts. Sie koennen die PDF-Datei dann speichern, drucken oder per E-Mail versenden.',
    category: 'Befunde',
    order: 8,
  },
  {
    id: 'faq-009',
    question: 'Was ist der Verlaufsanzeige?',
    answer: 'Die Verlaufsanzeige zeigt Ihnen die Entwicklung eines Laborwertes ueber die Zeit. So koennen Sie und Ihr Arzt Trends erkennen und die Wirksamkeit von Behandlungen besser beurteilen.',
    category: 'Befunde',
    order: 9,
  },
  {
    id: 'faq-010',
    question: 'Wie kontaktiere ich den Support?',
    answer: 'Sie erreichen unseren Support unter:\n- E-Mail: support@labgate.de\n- Telefon: 0800 123 4567 (Mo-Fr 8-18 Uhr)\n\nOder nutzen Sie das Feedback-Formular in der App unter Hilfe > Feedback.',
    category: 'Support',
    order: 10,
  },
];

export const mockFAQHandlers = {
  getFAQs: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<FAQ>>> => {
    const params = config.params || {};
    const pageSize = params.itemsPerPage || 100;

    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<FAQ>>({
      Results: mockFAQData.sort((a, b) => (a.order || 0) - (b.order || 0)),
      CurrentPage: 1,
      ItemsPerPage: pageSize,
      TotalCount: mockFAQData.length,
    });
  },

  getFAQById: async (config: AxiosRequestConfig): Promise<AxiosResponse<FAQ>> => {
    const id = config.url?.split('/').pop();
    const faq = mockFAQData.find(f => f.id === id);

    if (!faq) {
      throw createMockError('FAQ nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(faq);
  },
};

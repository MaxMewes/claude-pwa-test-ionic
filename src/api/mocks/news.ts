import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NewsArticle, PaginatedResponse } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockNewsArticles: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Neue Laborparameter verfuegbar',
    summary: 'Ab sofort koennen Sie erweiterte Schilddruesen-Diagnostik und Vitamin-D-Metaboliten abrufen.',
    content: `
      <h2>Erweiterte Diagnostik</h2>
      <p>Wir freuen uns, Ihnen mitteilen zu koennen, dass ab sofort folgende neue Laborparameter in der labGate App verfuegbar sind:</p>
      <ul>
        <li><strong>Erweiterte Schilddruesen-Diagnostik:</strong> Neben TSH, fT3 und fT4 nun auch TPO-AK, TG-AK und TRAK</li>
        <li><strong>Vitamin-D-Metaboliten:</strong> 25-OH-Vitamin D3, 1,25-Dihydroxy-Vitamin D</li>
        <li><strong>Entzuendungsmarker:</strong> Procalcitonin (PCT), Interleukin-6 (IL-6)</li>
      </ul>
      <p>Diese Parameter werden automatisch in Ihren Befunden angezeigt, wenn sie vom Labor angefordert wurden.</p>
    `,
    category: 'announcement',
    imageUrl: 'https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=800',
    publishedAt: '2024-01-15T09:00:00Z',
    author: 'labGate Team',
    isRead: false,
    isPinned: true,
  },
  {
    id: 'news-002',
    title: 'Tipps zur Blutabnahme nuechtern',
    summary: 'Erfahren Sie, warum die Nuechternblutabnahme wichtig ist und wie Sie sich optimal vorbereiten.',
    content: `
      <h2>Warum nuechtern?</h2>
      <p>Viele Laborwerte werden durch Nahrungsaufnahme beeinflusst. Um verlaessliche Ergebnisse zu erhalten, ist es wichtig, bestimmte Regeln zu beachten.</p>

      <h3>Vor der Blutabnahme</h3>
      <ul>
        <li>Mindestens 8-12 Stunden keine Nahrungsaufnahme</li>
        <li>Wasser trinken ist erlaubt und wichtig</li>
        <li>Medikamente nur nach Ruecksprache mit dem Arzt</li>
        <li>Kein Kaffee oder Tee am Morgen</li>
      </ul>

      <h3>Welche Werte sind betroffen?</h3>
      <p>Besonders wichtig ist das Nuechternsein fuer:</p>
      <ul>
        <li>Blutzucker (Glucose)</li>
        <li>Blutfette (Cholesterin, Triglyceride)</li>
        <li>Leberwerte</li>
      </ul>
    `,
    category: 'health_tip',
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    publishedAt: '2024-01-12T14:30:00Z',
    author: 'Dr. med. Sarah Mueller',
    isRead: true,
    isPinned: false,
  },
  {
    id: 'news-003',
    title: 'Labor Berlin erweitert Oeffnungszeiten',
    summary: 'Ab Februar 2024 ist unser Partnerlabor in Berlin auch samstags bis 14 Uhr geoeffnet.',
    content: `
      <h2>Erweiterte Servicezeiten</h2>
      <p>Um Ihnen noch besseren Service zu bieten, erweitert Labor Berlin ab 1. Februar 2024 die Oeffnungszeiten:</p>

      <h3>Neue Oeffnungszeiten</h3>
      <ul>
        <li><strong>Montag - Freitag:</strong> 07:00 - 18:00 Uhr</li>
        <li><strong>Samstag:</strong> 08:00 - 14:00 Uhr (NEU!)</li>
      </ul>

      <p>Die erweiterten Samstagszeiten ermoeglichen es Berufstaetigen, ihre Labortermine flexibler zu planen.</p>

      <h3>Terminvereinbarung</h3>
      <p>Termine koennen wie gewohnt telefonisch oder ueber die labGate App vereinbart werden.</p>
    `,
    category: 'laboratory_news',
    publishedAt: '2024-01-10T11:00:00Z',
    author: 'Labor Berlin',
    isRead: false,
    isPinned: false,
  },
  {
    id: 'news-004',
    title: 'App-Update: Version 2.5 verfuegbar',
    summary: 'Neues Design, verbesserte Performance und Offline-Modus fuer Ihre Befunde.',
    content: `
      <h2>Was ist neu in Version 2.5?</h2>

      <h3>Neues Design</h3>
      <p>Wir haben das Design der App ueberarbeitet, um Ihnen eine noch bessere Benutzererfahrung zu bieten. Die Navigation wurde vereinfacht und die Lesbarkeit verbessert.</p>

      <h3>Offline-Modus</h3>
      <p>Ab sofort koennen Sie Ihre Befunde auch ohne Internetverbindung einsehen. Die App speichert automatisch Ihre letzten Befunde lokal auf Ihrem Geraet.</p>

      <h3>Performance-Verbesserungen</h3>
      <ul>
        <li>Schnellere Ladezeiten</li>
        <li>Reduzierter Datenverbrauch</li>
        <li>Optimierte Batterielaufzeit</li>
      </ul>

      <h3>Fehlerbehebungen</h3>
      <p>Verschiedene kleinere Fehler wurden behoben, um die Stabilitaet der App zu verbessern.</p>
    `,
    category: 'app_update',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    publishedAt: '2024-01-08T16:00:00Z',
    author: 'labGate Team',
    isRead: true,
    isPinned: false,
  },
  {
    id: 'news-005',
    title: 'Grippe-Saison: Wichtige Laborparameter',
    summary: 'Welche Laborwerte bei grippeaehnlichen Symptomen aussagekraeftig sind.',
    content: `
      <h2>Labordiagnostik bei Atemwegsinfekten</h2>
      <p>In der aktuellen Grippe-Saison moechten wir Sie ueber wichtige Laborparameter informieren.</p>

      <h3>Relevante Parameter</h3>
      <ul>
        <li><strong>Grosses Blutbild:</strong> Leukozyten, Differenzialblutbild</li>
        <li><strong>Entzuendungsmarker:</strong> CRP, BSG, Procalcitonin</li>
        <li><strong>Schnelltests:</strong> Influenza A/B, RSV, COVID-19</li>
      </ul>

      <h3>Wann zum Arzt?</h3>
      <p>Bei folgenden Symptomen sollten Sie aerztlichen Rat suchen:</p>
      <ul>
        <li>Fieber ueber 39°C</li>
        <li>Atemnot</li>
        <li>Starke Brustschmerzen</li>
        <li>Symptome laenger als 7 Tage</li>
      </ul>
    `,
    category: 'health_tip',
    publishedAt: '2024-01-05T10:00:00Z',
    author: 'Dr. med. Michael Weber',
    isRead: true,
    isPinned: false,
  },
];

export const mockNewsHandlers = {
  getNews: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<NewsArticle>>> => {
    const params = config.params as { page?: number; pageSize?: number; category?: string } || {};
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const category = params.category;

    let filtered = mockNewsArticles;
    if (category) {
      filtered = mockNewsArticles.filter((n) => n.category === category);
    }

    // Sort by publishedAt desc, pinned first
    filtered = [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const start = (page - 1) * pageSize;
    const paginatedNews = filtered.slice(start, start + pageSize);

    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<NewsArticle>>({
      Items: paginatedNews,
      CurrentPage: page,
      ItemsPerPage: pageSize,
      TotalItemsCount: filtered.length,
    });
  },

  getNewsById: async (config: AxiosRequestConfig): Promise<AxiosResponse<NewsArticle>> => {
    const id = config.url?.split('/').pop();
    const article = mockNewsArticles.find((n) => n.id === id);

    if (!article) {
      throw createMockError('Artikel nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(article);
  },

  markAsRead: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const id = config.url?.split('/')[2];
    const article = mockNewsArticles.find((n) => n.id === id);
    if (article) {
      article.isRead = true;
    }
    return createMockResponse({ success: true });
  },
};

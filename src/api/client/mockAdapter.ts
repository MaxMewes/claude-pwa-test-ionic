import { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { mockAuthHandlers } from '../mocks/auth';
import { mockResultsHandlers } from '../mocks/results';
import { mockPatientsHandlers } from '../mocks/patients';
import { mockLaboratoriesHandlers } from '../mocks/laboratories';
import { mockNewsHandlers } from '../mocks/news';
import { mockSettingsHandlers } from '../mocks/settings';
import { mockSendersHandlers } from '../mocks/senders';
import { mockFAQHandlers } from '../mocks/faq';
import { mockFeedbackHandlers } from '../mocks/feedback';

type MockHandler = (config: AxiosRequestConfig) => Promise<AxiosResponse>;

interface MockRoute {
  method: string;
  pattern: RegExp;
  handler: MockHandler;
}

const mockRoutes: MockRoute[] = [
  // Auth routes
  { method: 'post', pattern: /\/auth\/login$/, handler: mockAuthHandlers.login },
  { method: 'post', pattern: /\/auth\/two-factor$/, handler: mockAuthHandlers.twoFactor },
  { method: 'post', pattern: /\/auth\/refresh$/, handler: mockAuthHandlers.refresh },
  { method: 'post', pattern: /\/auth\/logout$/, handler: mockAuthHandlers.logout },
  { method: 'get', pattern: /\/auth\/me$/, handler: mockAuthHandlers.getMe },
  { method: 'post', pattern: /\/auth\/change-password$/, handler: mockAuthHandlers.changePassword },
  { method: 'post', pattern: /\/auth\/register$/, handler: mockAuthHandlers.register },
  { method: 'post', pattern: /\/auth\/reset-password$/, handler: mockAuthHandlers.resetPassword },
  { method: 'get', pattern: /\/auth\/password-rules$/, handler: mockAuthHandlers.getPasswordRules },

  // Results routes
  { method: 'get', pattern: /\/results$/, handler: mockResultsHandlers.getResults },
  { method: 'get', pattern: /\/results\/counter$/, handler: mockResultsHandlers.getCounter },
  { method: 'get', pattern: /\/results\/[^/]+\/cumulative$/, handler: mockResultsHandlers.getCumulative },
  { method: 'get', pattern: /\/results\/[^/]+$/, handler: mockResultsHandlers.getResultById },
  { method: 'get', pattern: /\/results\/[^/]+\/trend\/[^/]+$/, handler: mockResultsHandlers.getTrend },
  { method: 'patch', pattern: /\/results\/[^/]+\/read$/, handler: mockResultsHandlers.markAsRead },
  { method: 'patch', pattern: /\/results\/mark-as-read$/, handler: mockResultsHandlers.markAsRead },
  { method: 'patch', pattern: /\/results\/mark-as-unread$/, handler: mockResultsHandlers.markAsUnread },
  { method: 'patch', pattern: /\/results\/mark-as-favorite$/, handler: mockResultsHandlers.markAsFavorite },
  { method: 'patch', pattern: /\/results\/mark-as-not-favorite$/, handler: mockResultsHandlers.markAsNotFavorite },
  { method: 'patch', pattern: /\/results\/mark-as-archived$/, handler: mockResultsHandlers.markAsArchived },
  { method: 'patch', pattern: /\/results\/mark-as-not-archived$/, handler: mockResultsHandlers.markAsNotArchived },
  { method: 'patch', pattern: /\/results\/[^/]+\/pin$/, handler: mockResultsHandlers.togglePin },

  // Patients routes
  { method: 'get', pattern: /\/patients$/, handler: mockPatientsHandlers.getPatients },
  { method: 'get', pattern: /\/patients\/[^/]+$/, handler: mockPatientsHandlers.getPatientById },
  { method: 'get', pattern: /\/patients\/[^/]+\/results$/, handler: mockPatientsHandlers.getPatientResults },

  // Laboratories routes
  { method: 'get', pattern: /\/laboratories$/, handler: mockLaboratoriesHandlers.getLaboratories },
  { method: 'get', pattern: /\/laboratories\/service-catalog$/, handler: mockLaboratoriesHandlers.getServiceCatalog },
  { method: 'get', pattern: /\/laboratories\/service-catalog\/[^/]+$/, handler: mockLaboratoriesHandlers.getServiceItem },
  { method: 'get', pattern: /\/laboratories\/[^/]+\/messages$/, handler: mockLaboratoriesHandlers.getMessages },
  { method: 'post', pattern: /\/laboratories\/send-message$/, handler: mockLaboratoriesHandlers.sendMessage },
  { method: 'patch', pattern: /\/messages\/[^/]+$/, handler: mockLaboratoriesHandlers.markMessageAsRead },
  { method: 'get', pattern: /\/laboratories\/[^/]+$/, handler: mockLaboratoriesHandlers.getLaboratoryById },

  // Senders routes
  { method: 'get', pattern: /\/senders$/, handler: mockSendersHandlers.getSenders },
  { method: 'get', pattern: /\/senders\/[^/]+$/, handler: mockSendersHandlers.getSenderById },

  // News routes
  { method: 'get', pattern: /\/news$/, handler: mockNewsHandlers.getNews },
  { method: 'get', pattern: /\/news\/[^/]+$/, handler: mockNewsHandlers.getNewsById },
  { method: 'patch', pattern: /\/news\/[^/]+\/read$/, handler: mockNewsHandlers.markAsRead },

  // FAQ routes
  { method: 'get', pattern: /\/faqs$/, handler: mockFAQHandlers.getFAQs },
  { method: 'get', pattern: /\/faqs\/[^/]+$/, handler: mockFAQHandlers.getFAQById },

  // Feedback routes
  { method: 'post', pattern: /\/feedbacks$/, handler: mockFeedbackHandlers.sendFeedback },

  // Settings routes
  { method: 'get', pattern: /\/settings$/, handler: mockSettingsHandlers.getSettings },
  { method: 'patch', pattern: /\/settings$/, handler: mockSettingsHandlers.updateSettings },
  { method: 'put', pattern: /\/settings$/, handler: mockSettingsHandlers.updateSettings },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function findRoute(method: string, url: string): MockRoute | undefined {
  return mockRoutes.find(
    (route) => route.method === method.toLowerCase() && route.pattern.test(url)
  );
}

export function setupMockAdapter(axiosInstance: AxiosInstance): void {
  // Store original methods
  const originalGet = axiosInstance.get.bind(axiosInstance);
  const originalPost = axiosInstance.post.bind(axiosInstance);
  const originalPut = axiosInstance.put.bind(axiosInstance);
  const originalPatch = axiosInstance.patch.bind(axiosInstance);
  const originalDelete = axiosInstance.delete.bind(axiosInstance);

  const createGetHandler = (originalMethod: typeof originalGet) => {
    return async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      const route = findRoute('get', url);

      if (route) {
        await delay(200 + Math.random() * 300);
        const fullConfig: AxiosRequestConfig = { method: 'get', url, ...config };
        return await route.handler(fullConfig) as AxiosResponse<T>;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalMethod(url, config) as any;
    };
  };

  const createPostHandler = (method: 'post' | 'put' | 'patch', originalMethod: typeof originalPost) => {
    return async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      const route = findRoute(method, url);

      if (route) {
        await delay(200 + Math.random() * 300);
        const fullConfig: AxiosRequestConfig = { method, url, data, ...config };
        return await route.handler(fullConfig) as AxiosResponse<T>;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalMethod(url, data, config) as any;
    };
  };

  const createDeleteHandler = (originalMethod: typeof originalDelete) => {
    return async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      const route = findRoute('delete', url);

      if (route) {
        await delay(200 + Math.random() * 300);
        const fullConfig: AxiosRequestConfig = { method: 'delete', url, ...config };
        return await route.handler(fullConfig) as AxiosResponse<T>;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalMethod(url, config) as any;
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance.get = createGetHandler(originalGet) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance.post = createPostHandler('post', originalPost) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance.put = createPostHandler('put', originalPut) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance.patch = createPostHandler('patch', originalPatch) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance.delete = createDeleteHandler(originalDelete) as any;
}

export function createMockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig,
  };
}

export function createMockError(message: string, status = 400, code = 'ERROR') {
  const error = new Error(message) as Error & { response: AxiosResponse };
  error.response = {
    data: { code, message },
    status,
    statusText: 'Error',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig,
  };
  return error;
}

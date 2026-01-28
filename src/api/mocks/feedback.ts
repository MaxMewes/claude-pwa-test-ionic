import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FeedbackRequest, FeedbackResponse } from '../types';
import { createMockResponse } from '../client/mockAdapter';

export const mockFeedbackHandlers = {
  sendFeedback: async (config: AxiosRequestConfig): Promise<AxiosResponse<FeedbackResponse>> => {
    const data = config.data as FeedbackRequest;

    // Simulate sending feedback
    console.log('Feedback received:', data);

    return createMockResponse<FeedbackResponse>({
      success: true,
      message: 'Vielen Dank fuer Ihr Feedback! Wir werden uns schnellstmoeglich darum kuemmern.',
      ticketId: `TICKET-${Date.now()}`,
    });
  },
};

import { apiClient } from './client';

interface InquiryBody {
  email: string;
  message: string;
}

export const inquiryApi = {
  create: (body: InquiryBody) => apiClient.post('/v4/users/inquiries', body),
};

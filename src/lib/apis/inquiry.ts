import axios from 'axios';
import { BASE_URL } from '@/constants/api';

interface InquiryBody {
  email: string;
  message: string;
}

export const inquiryApi = {
  create: (body: InquiryBody) =>
    axios.post(`${BASE_URL}/api/v4/users/inquiries`, body),
};

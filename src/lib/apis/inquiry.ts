import axios from 'axios';
import { BASE_URL } from '@/constants/api';

interface InquiryBody {
  email: string;
  message: string;
}

export const inquiryApi = {
  create: (body: InquiryBody) => {
    if (!BASE_URL) throw new Error('BASE_URL이 설정되지 않았습니다');
    return axios.post(`${BASE_URL}/api/v4/users/inquiries`, body);
  },
};

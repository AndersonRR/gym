import axios from 'axios';
import { AppError } from '@utils/AppError';

export const api = axios.create({
  baseURL: 'http://192.168.2.118:3333',
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.data) {
      return Promise.reject(new AppError(error.response.data.message));
    } else {
      return Promise.reject(
        new AppError('Error no servidor. Tente novamente em alguns instantes.')
      );
    }
  }
);

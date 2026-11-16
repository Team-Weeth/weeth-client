import { authHandlers } from './auth';
import { feedbackHandlers } from './feedback';

export const handlers = [...authHandlers, ...feedbackHandlers];

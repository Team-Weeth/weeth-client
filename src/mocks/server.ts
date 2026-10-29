import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { feedbackHandlers } from './handlers/feedback';
import { scheduleHandlers } from './handlers/schedule';

export const server = setupServer(...authHandlers, ...scheduleHandlers, ...feedbackHandlers);

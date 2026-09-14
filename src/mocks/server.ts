import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { scheduleHandlers } from './handlers/schedule';

export const server = setupServer(...authHandlers, ...scheduleHandlers);

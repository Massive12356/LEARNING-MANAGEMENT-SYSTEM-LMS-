import { StudentLoginHistorySession } from '../types';

export const isSessionActive = (session: StudentLoginHistorySession): boolean =>
  session.logoutTime === 'Session still active' || session.duration === 'Session in progress';

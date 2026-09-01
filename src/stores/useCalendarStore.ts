import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

function getInitialState() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    selectedDate: null as string | null, // "YYYY-MM-DD"
    sessionEnabled: true,
    eventEnabled: true,
    attendanceOnly: false,
  };
}

const initialState = getInitialState();

export const useCalendarStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      prevMonth: () => {
        const { year, month } = get();
        if (month === 1) set({ year: year - 1, month: 12, selectedDate: null }, false, 'prevMonth');
        else set({ month: month - 1, selectedDate: null }, false, 'prevMonth');
      },
      nextMonth: () => {
        const { year, month } = get();
        if (month === 12) set({ year: year + 1, month: 1, selectedDate: null }, false, 'nextMonth');
        else set({ month: month + 1, selectedDate: null }, false, 'nextMonth');
      },
      toggleDate: (date: string) => {
        const { selectedDate } = get();
        set({ selectedDate: selectedDate === date ? null : date }, false, 'toggleDate');
      },
      toggleSession: () =>
        set((s) => ({ sessionEnabled: !s.sessionEnabled }), false, 'toggleSession'),
      toggleEvent: () => set((s) => ({ eventEnabled: !s.eventEnabled }), false, 'toggleEvent'),
      toggleAttendance: () =>
        set((s) => ({ attendanceOnly: !s.attendanceOnly }), false, 'toggleAttendance'),
      reset: () => set(getInitialState(), false, 'reset'),
    })),
    { name: 'CalendarStore' },
  ),
);

// Selector hooks
export const useCalendarYear = () => useCalendarStore((s) => s.year);
export const useCalendarMonth = () => useCalendarStore((s) => s.month);
export const useCalendarSelectedDate = () => useCalendarStore((s) => s.selectedDate);
export const useCalendarFilters = () =>
  useCalendarStore(
    useShallow((s) => ({
      sessionEnabled: s.sessionEnabled,
      eventEnabled: s.eventEnabled,
      attendanceOnly: s.attendanceOnly,
    })),
  );
export const useCalendarActions = () =>
  useCalendarStore(
    useShallow((s) => ({
      prevMonth: s.prevMonth,
      nextMonth: s.nextMonth,
      toggleDate: s.toggleDate,
      toggleSession: s.toggleSession,
      toggleEvent: s.toggleEvent,
      toggleAttendance: s.toggleAttendance,
      reset: s.reset,
    })),
  );

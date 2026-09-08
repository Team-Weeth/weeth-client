import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { ScheduleDetail } from '@/types/calendar';

function getInitialState() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    selectedDate: null as string | null, // "YYYY-MM-DD"
    sessionEnabled: true,
    eventEnabled: true,
    attendanceOnly: false,
    monthPickerOpen: false,
    scheduleDetailOpen: false,
    attendeeListOpen: false,
    selectedSchedule: null as ScheduleDetail | null,
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
      goToYearMonth: (year: number, month: number) =>
        set({ year, month, selectedDate: null }, false, 'goToYearMonth'),
      openMonthPicker: () => set({ monthPickerOpen: true }, false, 'openMonthPicker'),
      closeMonthPicker: () => set({ monthPickerOpen: false }, false, 'closeMonthPicker'),
      openScheduleDetail: (schedule: ScheduleDetail) =>
        set(
          { scheduleDetailOpen: true, selectedSchedule: schedule },
          false,
          'openScheduleDetail',
        ),
      closeScheduleDetail: () =>
        set(
          { scheduleDetailOpen: false, attendeeListOpen: false, selectedSchedule: null },
          false,
          'closeScheduleDetail',
        ),
      openAttendeeList: () => set({ attendeeListOpen: true }, false, 'openAttendeeList'),
      closeAttendeeList: () => set({ attendeeListOpen: false }, false, 'closeAttendeeList'),
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
export const useCalendarMonthPickerOpen = () => useCalendarStore((s) => s.monthPickerOpen);
export const useCalendarScheduleDetailOpen = () => useCalendarStore((s) => s.scheduleDetailOpen);
export const useCalendarAttendeeListOpen = () => useCalendarStore((s) => s.attendeeListOpen);
export const useCalendarSelectedSchedule = () => useCalendarStore((s) => s.selectedSchedule);
export const useCalendarActions = () =>
  useCalendarStore(
    useShallow((s) => ({
      prevMonth: s.prevMonth,
      nextMonth: s.nextMonth,
      toggleDate: s.toggleDate,
      toggleSession: s.toggleSession,
      toggleEvent: s.toggleEvent,
      toggleAttendance: s.toggleAttendance,
      goToYearMonth: s.goToYearMonth,
      openMonthPicker: s.openMonthPicker,
      closeMonthPicker: s.closeMonthPicker,
      openScheduleDetail: s.openScheduleDetail,
      closeScheduleDetail: s.closeScheduleDetail,
      openAttendeeList: s.openAttendeeList,
      closeAttendeeList: s.closeAttendeeList,
      reset: s.reset,
    })),
  );

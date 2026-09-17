import React, { useState, useEffect } from 'react';
import { calendarApi } from '../services/api';
import { CalendarEventItem } from '../types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  AlertTriangle,
  CreditCard,
  ListFilter,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/Modal';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await calendarApi.getEvents();
        setEvents(res.events);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Calendar navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Generate days for the month grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d);
  }

  // Get events on a specific day
  const getEventsForDay = (day: number): CalendarEventItem[] => {
    return events.filter((ev) => {
      const d = new Date(ev.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Renewal Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visual schedule of upcoming subscription renewals and trial expiration milestones.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('month')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span>Regular Renewal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>Urgent Renewal (≤ 3 Days)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span>Free Trial Expiration</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500">Loading schedule...</p>
        </div>
      ) : viewMode === 'month' ? (
        /* Month Calendar Grid */
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[85px] rounded-xl bg-slate-50/50 p-2 dark:bg-slate-950/20"
                  />
                );
              }

              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[95px] rounded-xl border p-1.5 transition-colors ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/20'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[60px]">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 ${
                          ev.type === 'TRIAL_EXPIRY'
                            ? 'bg-orange-500'
                            : ev.daysRemaining <= 3
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {ev.serviceName} ({formatCurrency(ev.cost, ev.currency)})
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Upcoming Renewal & Trial Timeline
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs ${
                      ev.type === 'TRIAL_EXPIRY'
                        ? 'bg-orange-500'
                        : ev.daysRemaining <= 3
                        ? 'bg-rose-500'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {ev.type === 'TRIAL_EXPIRY' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ev.serviceName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {ev.provider} • {ev.type === 'TRIAL_EXPIRY' ? 'Trial Expiration' : 'Scheduled Renewal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ev.cost, ev.currency)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(ev.date)}</p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ev.daysRemaining <= 3
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    in {ev.daysRemaining} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.serviceName}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {formatCurrency(selectedEvent.cost, selectedEvent.currency)}
                </p>
                <p className="text-slate-400">{selectedEvent.billingCycle} Cycle</p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 font-bold ${
                  selectedEvent.type === 'TRIAL_EXPIRY'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}
              >
                {selectedEvent.type === 'TRIAL_EXPIRY' ? 'Trial Expiration' : 'Renewal Event'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
              <div>
                <span className="text-slate-400 block mb-0.5">Event Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedEvent.date)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Time Remaining</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedEvent.daysRemaining} days
                </span>
              </div>
            </div>

            {selectedEvent.providerUrl && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={selectedEvent.providerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <span>Manage on Official {selectedEvent.provider} Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

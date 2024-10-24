import { CalendarEvent } from './eventTypes';
import moment from 'moment-timezone';

export const exportEventsToICS = (events: CalendarEvent[]) => {
  let icsContent =
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MindPlexa//Calendar//EN\n';

  events.forEach((event) => {
    icsContent += `BEGIN:VEVENT\n`;
    icsContent += `UID:${event.id}\n`;
    icsContent += `SUMMARY:${event.title}\n`;
    icsContent += `DTSTART;TZID=${event.timezone}:${formatDateToICS(event.start, event.timezone)}\n`;
    icsContent += `DTEND;TZID=${event.timezone}:${formatDateToICS(event.end, event.timezone)}\n`;
    icsContent += `END:VEVENT\n`;
  });

  icsContent += 'END:VCALENDAR';

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'events.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatDateToICS = (date: Date, timezone: string) => {
  return moment(date).tz(timezone).format('YYYYMMDDTHHmmss');
};

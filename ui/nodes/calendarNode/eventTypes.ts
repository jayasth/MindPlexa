export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  category?: string;
}

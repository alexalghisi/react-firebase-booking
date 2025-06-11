import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  createBooking,
  deleteBooking,
  listenBookings,
} from '../services/bookings';

export default function Calendar({ uid }) {
  const [events, setEvents] = useState([]);
  useEffect(() => listenBookings(setEvents), []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable
      selectMirror
      height="auto"
      events={events}
      select={async info => {
        const title = prompt('Booking title:');
        if (title)
          await createBooking({
            title,
            start: info.start,
            end: info.end,
            userId: uid,
          });
      }}
      eventClick={async info => {
        if (info.event.extendedProps.userId !== uid) return; // only owner
        if (window.confirm('Delete this booking?'))
          await deleteBooking(info.event.id);
      }}
    />
  );
}

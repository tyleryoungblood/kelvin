
import { fetchRoomsAvailability } from './fetchData.js';
import { drawRedLine } from './red-line.js';

export const drawChart = async (rooms, date = null) => {
  date = date || moment();
  console.log("Showing chart for ", date.format());

  const open_time = moment.min(
    rooms.map(room => {
      const hours = room.location.hours[date.day()].starthours;
      const time = date
        .clone()
        .hour(Math.floor(hours / 100))
        .minute(hours % 100);
      return time;
    })
  );
  const close_time = moment.max(
    rooms.map(room => {
      const hours = room.location.hours[date.day()].endhours;
      const time = date
        .clone()
        .hour(Math.floor(hours / 100))
        .minute(hours % 100);
      return time;
    })
  );

  const cols = close_time.diff(open_time, "minutes") / 15;
  const rows = rooms.length + 1;

  const stage2 = $("<div/>", {
    id: "stage2"
  });

  // render open hours
  stage2.css('grid-template-columns', `auto repeat(${cols}, 1fr)`);
  const openDiv = $('<div/>', {
    class: 'open-header',
    text: ''
  });

  const openStr = open_time.format("MM/DD hh:mm A");
  const closeStr = close_time.format("MM/DD hh:mm A");
  const openHoursDiv = $("<div/>", {
    class: "open-hours",
    text: `Opening hours: ${openStr} - ${closeStr}`,
    style: "grid-column: 2 / -1; grid-row: 1;"
  });
  stage2.append([openDiv, openHoursDiv]);

  const drawHours = (rowStart = 2, extraClasses = '') => {
    for (let i = 0; i < cols / 4; i++) {
      const time = open_time.clone().add(i, "hours");
      const div = $("<div/>", {
        text: `${time.format("h a")}`,
        class: `grid-hours ${extraClasses}`,
      });
      div.css("grid-column", `${i * 4 + 2} / span 4`);
      div.css("grid-row", `${rowStart}`);
      stage2.append(div);
    }
  };

  drawHours(2, "hours-header");

  const open_range = moment.range(open_time, close_time);
  const events = await fetchRoomsAvailability(rooms, date);

  let cRow = 2; // 1st=header, 2nd=hours, hence the offset

  // Sort rooms at Main by room number
  // Otherwise Meeting Rooms 200-214 show, and then Study Rooms 206-209 show.
  // Instead it should show Meeting Room 200 ... Meeing Room 205, Study Room 206 ... Study Room 209, Meeting Room 213, Meeting Room 214
  rooms = rooms.sort((a, b) => {
    // check to see if this is a room located at main
    if (
      a.location.title == "Richland Library Main" &&
      b.location.title == "Richland Library Main"
    ) {
      // sort rooms at main so that the meeting and study rooms are in numeric order.

      // first, strip all non-numeric values from a and b strings
      a = a.title.replace(/\D/g, "");
      b = b.title.replace(/\D/g, "");

      // check to see if it's a single digit room, and if so, pad the digits with two leading zeros
      // if you don't do this, Family Career Studio desk 1 and 2 display, then meeting and study rooms,
      // and then Family Career Studio Desk 3 and 4 display
      if (a.length > 0 && a.length < 3) {
        a = "00" + a;
      }

      if (b.length > 0 && b.length < 3) {
        b = "00" + b;
      }

      // check to make sure both a and b are rooms with numbers - prevents sorting BCRC above Auditorium
      if (a >= 1 && b >= 1) {
        // finally perform the sort
        return a > b ? 1 : -1;
      }
    }
  });

  for (const room of rooms) {
    cRow++;
    const roomNameDiv = $("<div/>", {
      text: room.title,
      style: `grid-row: ${cRow};`,
      class: "room-name"
    });
    stage2.append(roomNameDiv);

    if (events[room.id] && events[room.id].is_closed) {
      const row = $("<div/>", {
        text: `${events[room.id].closed_message}`,
        class: "room-reserved room-closed"
      });
      $(row).css("grid-row", `${cRow}`);
      $(row).css("grid-column", "2 / -1");
      stage2.append(row);
      continue;
    }

    const dates = events[room.id] && events[room.id].dates;
    if (!dates) {
      continue;
    }

    for (const evtId in dates) {
      let { start, end } = dates[evtId];
      start = moment.utc(start).local();
      end = moment.utc(end).local();

      // skip whatever isn't in the current day schedule
      const range = moment.range(start, end);
      if (!range.overlaps(open_range)) {
        continue;
      }

      // truncate to open hours
      start = open_range.contains(start) ? start : open_range.start;
      end = open_range.contains(end) ? end : open_range.end;

      // render
      const colstart =
        2 + Math.ceil(start.diff(open_time, "minutes") / 15);
      const colspan = Math.ceil(end.diff(start, "minutes") / 15);
      const day = start.local().format("MMM DD");
      const startTime = start.local().format("hh:mm a");
      const endTime = end.local().format("hh:mm a");
      const hrs = moment.duration(end.diff(start)).humanize(false);
      const row = $("<div/>", {
        text: "",
        class: "reserved-event",
        title: `Reserved on ${day} from ${startTime} to ${endTime} (${hrs})`
      });
      $(row).css("grid-row", `${cRow}`);
      $(row).css("grid-column", `${colstart} / span ${colspan}`);
      stage2.append(row);
    }
  }

  // draw border
  for (let i = 0; i < cols / 4; i++) {
    const div = $("<div/>", {
      class: "highlight"
    });
    div.css("grid-column", `${i * 4 + 2} / span 4`);
    div.css("grid-row", `2 / ${cRow + 3}`);
    stage2.append(div);
  }

  drawHours(cRow + 1, "hours-footer");

  // replace stage2, avoid the flash
  $("#stage2").replaceWith(stage2);

  // draw red line if during current hours.
  const now = moment();
  if(moment.range(open_time, close_time).contains(now)) {
    drawRedLine(open_time);
  }
};



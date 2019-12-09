
import { drawStage2 } from './stage2.js';
import { loadSelectedRooms } from './utils.js';
import { fetchCachedData, getLocations, getLocationRooms } from './fetchData.js';

const findRoom = roomId => {
  for (const loc of locationData) {
    for (const room of loc.rooms) {
      if (room.id === roomId) {
        return room;
      }
    }
  }
};

export const drawStage1 = async () => {
  // begin here
  return fetchCachedData().then(data => {
    const locations = getLocations(data).map(loc => ({
      ...loc,
      rooms: getLocationRooms(data, loc)
    }));

    window.locationData = locations;

    let html = "<p>Select the rooms to show and click show at the bottom</p>";

    for (const loc of locations) {
      let rstr = loc.rooms.reduce(
        (acc, room) =>
        acc +
        `
                        <li class="room-item">
                          <input
                            type="checkbox"
                            class="room-input"
                            data-room="${room.id}"
                            />
                          ${room.title}
                        </li>`,
        ""
      );
      html += `<div class="location" data-location="${loc.id}">
                        <h3>
                          <input 
                            type="checkbox"
                            class="check-uncheck-all" />
                          ${loc.title}</h3>
                        <ul class="room-list">
                          ${rstr}
                        </ul>
                    </div>`;
    }

    const stage1 = $("#stage1");
    stage1.html(html);

    const button = $('\n<button>Show</button>');
    stage1.append(button);

    button.click(() => {
      const rooms = $(".room-input:checked")
        .map((idx, el) => findRoom(el.dataset.room))
        .get();
      drawStage2(rooms);
    });

    // allow user to check/uncheck all rooms for a given location
    stage1.find(".check-uncheck-all").change(function () {
      console.log($(this));
      $(this)
         .parent()
         .siblings()
         .find('input:checkbox')
         .prop('checked', this.checked);
    });

    loadSelectedRooms();

    return locations;
  });
};


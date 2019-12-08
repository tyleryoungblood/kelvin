
export const saveSelectedRooms = rooms => {
  localStorage.selectedRooms = JSON.stringify(rooms.map(room => room.id));
};

export const loadSelectedRooms = () => {
  if (localStorage.selectedRooms) {
    const roomIds = JSON.parse(localStorage.selectedRooms);
    for (const id of roomIds) {
      const el = document.querySelector(`input[data-room="${id}"]`);
      if (el) {
        el.checked = true;
      }
    }
  }
};


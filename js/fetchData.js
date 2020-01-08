
import { rcplBase } from './constants.js';

const fetchJson = async url => {
  const response = await fetch(url);
  return await response.json();
};

const fetchData = async () => {
  const url =
    rcplBase +
    "/jsonapi/node/room?filter%5Bstatus%5D%5Bvalue%5D=1&filter%5Bfield_staff_use_only%5D%5Bvalue%5D=false&filter%5Blocations%5D%5Bgroup%5D%5Bconjunction%5D=AND&filter%5BwithLocation%5D%5Bcondition%5D%5Bpath%5D=field_location.id&filter%5BwithLocation%5D%5Bcondition%5D%5Boperator%5D=%3C%3E&filter%5BwithLocation%5D%5Bcondition%5D%5BmemberOf%5D=locations&filter%5BonlyBranchLocation%5D%5Bcondition%5D%5Bpath%5D=field_location.field_branch_location&filter%5BonlyBranchLocation%5D%5Bcondition%5D%5Bvalue%5D=1&filter%5BonlyBranchLocation%5D%5Bcondition%5D%5BmemberOf%5D=locations&fields%5Bnode--room%5D=uuid%2Cstatus%2Ctitle%2Croom_thumbnail%2Cfield_capacity_max%2Cfield_capacity_min%2Cfield_reservable_online%2Cfield_room_fees%2Cfield_room_standard_equipment%2Cfield_reservation_phone_number%2Cfield_text_content%2Cfield_text_intro%2Cfield_text_teaser%2Ctype%2Cuid%2Cimage_primary%2Cfield_location%2Cfield_room_type&include=image_primary%2Cimage_primary.field_media_image%2Cfield_location&sort=title";
  console.log("Fetching rooms");

  const data = await fetchJson(url);

  // fetch all results
  let nextUrl = data.links.next && data.links.next.href;
  while(nextUrl) {
    nextUrl = nextUrl.replace('https://www.richlandlibrary.com', rcplBase);
    console.log("Fetching next page of rooms");

    // dedup included / locations filter
    const seenIds = new Set([...data.data, ...data.included].map(x => x.id));

    const next_data = await fetchJson(nextUrl);
    data.data = [
      ...data.data,
      ...next_data.data.filter(x => !seenIds.has(x.id))
    ];
    data.included = [
      ...data.included,
      ...next_data.included.filter(x => !seenIds.has(x.id))
    ];
    nextUrl = next_data.links.next && next_data.links.next.href;
  }

  return data;
};

export const fetchCachedData = async () => {
  const now = moment();
  let data = localStorage.roomData && JSON.parse(localStorage.roomData);

  const invalid =
    !data ||
    !data.expires ||
    !now.isBefore(moment(data.expires).add(1, "days"));
  if (invalid) {
    data = await fetchData();
    data.expires = moment().format();
    localStorage.roomData = JSON.stringify(data);
  }
  return data;
};

export const fetchRoomsAvailability = async (rooms, date = null) => {
  // show the selected date between prev/next buttons
  date = date.clone() || moment();
  const dateSelected = document.getElementById("dateSelected");
  dateSelected.innerHTML = date.format("dddd, MMMM Do");

  const url = rcplBase + "/api/rooms/availability";
  const dateFormat = "YYYY-MM-DDTHH:mm:ss"; // without the Z
  const payload = {
    rooms: rooms.map(room => room.id),
    start: date
    .startOf("day")
    .utc()
    .format(dateFormat),
    end: date
    .clone()
    .endOf("day")
    .utc()
    .format(dateFormat)
  };

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await response.json();
};

export const getLocations = data => {
  return data["included"]
    .filter(obj => obj.type === "node--location")
    .map(obj => ({
      id: obj.id,
      title: obj.attributes.title,
      hours: obj.attributes.field_location_hours
    }));
};

export const getLocationRooms = (data, location) => {
  const rooms = data["data"]
    .filter(
      obj => (
        obj.type === "node--room"
        && obj.relationships.field_location.data[0].id === location.id
      )
    )
    .map(obj => ({
      id: obj.id,
      title: obj.attributes.title,
      location: location
    }));
  rooms.sort((a, b) => a.title.localeCompare(b.title))
  return rooms;
};



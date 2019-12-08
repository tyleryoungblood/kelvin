
import { drawChart } from './chart.js';
import { saveSelectedRooms } from './utils.js';

export const drawStage2 = (rooms) => {
  console.log("Showing locations");
  saveSelectedRooms(rooms);
  console.log("rooms", rooms);

  $("#stage1").hide();
  $("#datePicker")
    .show()
    .removeClass("hidden");
  $("#stage2").html("Loading...");

  let selectedDate = moment().local();

  const changeDate = date => {
    console.log(selectedDate);
    selectedDate = moment(date);
    console.log("Changed date", date.format());
    drawChart(rooms, selectedDate.clone());
  };

  // register event handlers
  $("#nextDay").click(() =>
    changeDate(selectedDate.clone().add(1, "days"))
  );
  $("#prevDay").click(() =>
    changeDate(selectedDate.clone().subtract(1, "days"))
  );

  console.log("selected date = ", selectedDate.format());

  setInterval(() => {
    drawChart(rooms, selectedDate.clone()).then(() => {
      console.log(`Chart updated: ${moment().format("h:mm a")}`);
    });
  }, 1000 * 60); // update every minute;

  drawChart(rooms, selectedDate.clone()).then(() => {
    console.log(`Chart displayed ${moment().format("h:mm a")}`);
  });
};




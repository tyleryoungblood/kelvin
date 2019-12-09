
// create a red line that will show the approx current time on chart.
export const drawRedLine = (openTime) => {
  const stage2 = $("#stage2");
  const pxPerMin = $('.grid-hours').outerWidth() / 60; // number of pixels per minute
  const now = moment();
  const currentHr = now.hour() // current hour (in military time)
  const minsPastHr = now.minutes() // get number of minutes past the hour

  const hrsAfterStart = currentHr - moment(openTime).hour(); // difference between 9am and current time in hours

  const minsAfterStart = (hrsAfterStart * 60) + minsPastHr; // total number of minutes since opening
  const leftOffset = minsAfterStart * pxPerMin; // calculate number of pixels needed to move red line to proper hour
  const rlLeft = $('.room-name').outerWidth() + 8 + leftOffset; // account for room labels and 8px of margin

  const firstHourHeaderEl = $(".grid-hours.hours-header").first();
  const firstHourFooterEl = $(".grid-hours.hours-footer").first();
  const topHourP = firstHourHeaderEl.offset().top + firstHourHeaderEl.outerHeight();
  const rlheight = (
    firstHourFooterEl.offset().top
    - firstHourHeaderEl.offset().top 
    - firstHourFooterEl.outerHeight()
  ); // height of red line

  // create the red line
  const redLine = $('<span>', {'id': 'red-line'});
  redLine.css({
    'height': rlheight,
    'position': 'absolute',
    'left': rlLeft,
    'top': topHourP,
  });
  redLine.data("openTime", openTime);
  stage2.append(redLine);
};

// re-draw red line when a user resizes the window
$(() => {
  $(window).resize(function() {
    const redLine = $("#red-line");
    // only redraw if a red-line exists
    if(redLine.length > 0) {
      console.log('re-drawing red line');
      const openTime = redLine.data("openTime");
      redLine.remove();
      drawRedLine(openTime);
    }
  });
});


// create a red line that will show the approx current time on chart.
createRedLine = () => {
   const rlheight = $('#stage2').height() // height of red line
   const pxPerMin = $('.grid-hours').outerWidth() / 60; // number of pixels per minute
   const currentHr = moment().format('HH') // current hour (in military time)
   const minsPastHr = moment().format('mm') // get number of minutes past the hour

   const hrsAfterStart = currentHr - 9; // difference between 9am and current time in hours
   // TODO convert static 9 to dynamic value, or import value from index.html

   const minsAfterStart = (hrsAfterStart * 60) + parseInt(minsPastHr) // total number of minutes since opening
   const leftOffset = minsAfterStart * pxPerMin; // calculate number of pixels needed to move red line to proper hour
   const rlLeft = $('.room-name').outerWidth() + 8 + leftOffset; // account for room labels and 8px of margin
   

   // create the red line
   const redLine = $('<span>', {'id': 'red-line'});
   redLine.css({'height': rlheight,
                'position': 'absolute',
                'left': rlLeft,
               })
   $('#stage2').append(redLine);
}







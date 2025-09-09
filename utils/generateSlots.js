const moment = require('moment');

function generateSlots({ startDate, endDate, startTime, endTime, slotDuration }) {
  const slots = [];

  let currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate <= lastDate) {
    const dateStr = currentDate.format('YYYY-MM-DD');

    let currentTime = moment(`${dateStr} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endTimeMoment = moment(`${dateStr} ${endTime}`, 'YYYY-MM-DD HH:mm');

    while (currentTime < endTimeMoment) {
      slots.push({
        date: dateStr,
        time: currentTime.format('HH:mm')
      });

      currentTime.add(slotDuration, 'minutes');
    }

    currentDate.add(1, 'day');
  }

  return slots;
}

module.exports = generateSlots;

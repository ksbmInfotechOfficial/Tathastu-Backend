exports.generateScheduleEmail = ({ name, date, startTime, endTime, sessionType }) => {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Session Scheduled - Tathastu</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">

    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <tr style="background-color: #EA580C;">
        <td style="padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">Tathastu</h1>
          <p style="margin: 0; font-size: 14px;">Your spiritual guidance platform</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="font-size: 16px; color: #555;">
            We're happy to inform you that your session has been <strong>successfully scheduled</strong>.
          </p>

          <table style="width: 100%; margin-top: 20px; font-size: 16px; color: #444;">
            <tr>
              <td style="padding: 8px 0;"><strong>📅 Date:</strong></td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>🕒 Time:</strong></td>
              <td style="padding: 8px 0;">${startTime} – ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>📞 Session Type:</strong></td>
              <td style="padding: 8px 0;">${sessionType}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 16px; color: #555;">
            If you have any questions or need to reschedule, feel free to reply to this email.
          </p>

          <p style="margin-top: 40px; font-size: 14px; color: #999; text-align: center;">
            — Team Tathastu
          </p>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};


//   <div style="margin-top: 30px; text-align: center;">
//             <a href="#" style="background-color: #46266a; color: #fff; padding: 12px 25px; border-radius: 4px; text-decoration: none; font-weight: bold;">View Booking</a>
//           </div>




exports.generateRescheduleEmail = ({ name, date, startTime, endTime, sessionType, reason }) => {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Session Rescheduled - Tathastu</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">

    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <tr style="background-color: #EA580C;">
        <td style="padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">Tathastu</h1>
          <p style="margin: 0; font-size: 14px;">Your spiritual guidance platform</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="font-size: 16px; color: #555;">
            We would like to inform you that your session has been <strong>rescheduled</strong>.
          </p>

          <table style="width: 100%; margin-top: 20px; font-size: 16px; color: #444;">
            <tr>
              <td style="padding: 8px 0;"><strong>📅 New Date:</strong></td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>🕒 New Time:</strong></td>
              <td style="padding: 8px 0;">${startTime} – ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>📞 Session Type:</strong></td>
              <td style="padding: 8px 0;">${sessionType}</td>
            </tr>
            ${
              reason
                ? `<tr>
                    <td style="padding: 8px 0;"><strong>ℹ️ Reason:</strong></td>
                    <td style="padding: 8px 0;">${reason}</td>
                  </tr>`
                : ""
            }
          </table>

          <p style="margin-top: 30px; font-size: 16px; color: #555;">
            We apologize for any inconvenience this may have caused. If you have questions or need further assistance, please reply to this email.
          </p>

          <p style="margin-top: 40px; font-size: 14px; color: #999; text-align: center;">
            — Team Tathastu
          </p>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};



exports.generateReminderEmail = ({ name, date, startTime, endTime, sessionType }) => {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Session Reminder - Tathastu</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">

    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <tr style="background-color: #EA580C;">
        <td style="padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">Tathastu</h1>
          <p style="margin: 0; font-size: 14px;">Your spiritual guidance platform</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="font-size: 16px; color: #555;">
            This is a friendly reminder that your session is scheduled to begin soon.
          </p>

          <table style="width: 100%; margin-top: 20px; font-size: 16px; color: #444;">
            <tr>
              <td style="padding: 8px 0;"><strong>📅 Date:</strong></td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>🕒 Time:</strong></td>
              <td style="padding: 8px 0;">${startTime} – ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>📞 Session Type:</strong></td>
              <td style="padding: 8px 0;">${sessionType}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 16px; color: #555;">
            Please be ready at least 5 minutes before the session begins. If you have any questions or need assistance, feel free to reply to this email.
          </p>

          <p style="margin-top: 40px; font-size: 14px; color: #999; text-align: center;">
            — Team Tathastu
          </p>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};





exports.generateBookingConfirmationEmail = ({ name, sessionName, date, sessionType, time, bookedFor }) => {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // family member info check karo
  const bookedForText = bookedFor && bookedFor.isFamilyMember
    ? `This booking is for your family member: <strong>${bookedFor.name || 'Family Member'}</strong>.`
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Booking Confirmation - Tathastu</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">

    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <tr style="background-color: #EA580C;">
        <td style="padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">Tathastu</h1>
          <p style="margin: 0; font-size: 14px;">Your spiritual guidance platform</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333;">Hello ${name},</h2>
          <p style="font-size: 16px; color: #555;">
            Your booking has been <strong>confirmed</strong>. ${bookedForText}
          </p>

          <table style="width: 100%; margin-top: 20px; font-size: 16px; color: #444;">
            <tr>
              <td style="padding: 8px 0;"><strong>📅 Date:</strong></td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>🕒 Time:</strong></td>
              <td style="padding: 8px 0;">${time || 'To be decided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>📞 Session Name:</strong></td>
              <td style="padding: 8px 0;">${sessionName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>🔖 Session Type:</strong></td>
              <td style="padding: 8px 0;">${sessionType}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 16px; color: #555;">
            We look forward to assisting you on your spiritual journey. If you have any questions, feel free to reply to this email.
          </p>

          <p style="margin-top: 40px; font-size: 14px; color: #999; text-align: center;">
            — Team Tathastu
          </p>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

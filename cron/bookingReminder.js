const cron = require('node-cron');
const Booking = require('../models/customers/booking');
const { sendMail } = require('../helpers/mailer');
const { generateReminderEmail} = require('../utils/generateScheduleEmail')


cron.schedule('*/5 * * * *', async () => {
    console.log("⏰ Booking reminder job running...");

    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    try {
        const upcomingBookings = await Booking.find({
            status: "confirmed",
            reminderSent: false,
            "scheduledSession.date": {
                $gte: now,
                $lte: thirtyMinutesLater
            }
        });

        for (const booking of upcomingBookings) {
            const sessionTime = booking.scheduledSession.startTime;
            const sessionDate = booking.scheduledSession.date;

            if (!sessionTime || !sessionDate) continue;

            const [hours, minutes] = sessionTime.split(':');
            const sessionDateTime = new Date(sessionDate);
            sessionDateTime.setHours(hours, minutes, 0, 0);

            const diffInMs = sessionDateTime - now;
            const diffInMin = diffInMs / (1000 * 60);

           if (diffInMin >= 29 && diffInMin <= 31) {
    const email = booking.user?.email;
    const name = booking.user?.name || "User";

    if (email) {
        const content = generateReminderEmail({
            name,
            date: sessionDate,
            startTime: sessionTime,
            endTime: booking.scheduledSession.endTime || "",
            sessionType: booking.sessionType || "session"
        });

        await sendMail(email, "⏰ Upcoming Session Reminder", content);

        // Mark reminder as sent
        booking.reminderSent = true;
        await booking.save();

        console.log(`📧 Reminder sent to ${email}`);
    }
}

        }
    } catch (err) {
        console.error("❌ Error in booking reminder job:", err);
    }
});
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const startReminderService = () => {
    console.log('Reminder service started...');

    // Check every 5 minutes
    setInterval(async () => {
        try {
            const now = new Date();
            const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
            const twentyMinsFromNow = new Date(now.getTime() + 20 * 60000);

            // Find appointments starting between 15 and 20 minutes from now 
            // and that haven't been reminded yet (not adding a 'reminded' field to model now to keep it simple, 
            // but in production we should)
            const upcomingAppointments = await Appointment.find({
                date: {
                    $gte: fifteenMinsFromNow,
                    $lt: twentyMinsFromNow
                },
                status: 'confirmed',
                isReminded: false
            }).populate('patient doctor');


            for (const apt of upcomingAppointments) {
                // To avoid duplicate notifications, a simple way is needed.
                // For this MVP, we'll just send it.

                const message = `Your appointment for ${apt.reason} is starting in 15 minutes.`;

                // Notify Patient
                const patientNotif = await Notification.create({
                    user: apt.patient._id,
                    title: 'Appointment Reminder',
                    message: message,
                    type: 'appointment'
                });

                // Notify Doctor
                const doctorNotif = await Notification.create({
                    user: apt.doctor._id,
                    title: 'Appointment Reminder',
                    message: message,
                    type: 'appointment'
                });

                if (global.io) {
                    global.io.to(apt.patient._id.toString()).emit('notification', patientNotif);
                    global.io.to(apt.doctor._id.toString()).emit('notification', doctorNotif);
                }

                apt.isReminded = true;
                await apt.save();
            }
        } catch (error) {
            console.error('Error in reminder service:', error);
        }
    }, 5 * 60000);
};

module.exports = startReminderService;

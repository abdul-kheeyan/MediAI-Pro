const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc Book an appointment
// @route POST /api/appointments
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, reason } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(400).json({ message: 'Invalid doctor selected' });
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            date,
            reason,
        });

        // Notify Doctor
        const notification = await Notification.create({
            user: doctorId,
            title: 'New Appointment Booking',
            message: `${req.user.name} has booked an appointment for ${new Date(date).toLocaleString()}`,
            type: 'appointment'
        });

        if (global.io) {
            global.io.to(doctorId).emit('notification', notification);
        }

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user appointments
// @route GET /api/appointments
exports.getAppointments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query = { patient: req.user._id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user._id };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization profileImage')
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update appointment status
// @route PUT /api/appointments/:id
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name profileImage')
            .populate('doctor', 'name profileImage');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Authorization check - after populate(), patient/doctor are populated objects
        if (
            appointment.patient._id.toString() !== req.user._id.toString() &&
            appointment.doctor._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        appointment.status = status;
        await appointment.save();

        // Notify Patient if doctor updates status
        if (req.user.role === 'doctor') {
            const notification = await Notification.create({
                user: appointment.patient,
                title: 'Appointment Status Updated',
                message: `Dr. ${req.user.name} has ${status} your appointment for ${new Date(appointment.date).toLocaleString()}`,
                type: 'appointment'
            });

            if (global.io) {
                global.io.to(appointment.patient.toString()).emit('notification', notification);
            }
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

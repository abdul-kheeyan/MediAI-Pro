const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_app';

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    // WebRTC Signaling
    socket.on('join-call', (appointmentId) => {
        socket.join(appointmentId);
        console.log(`User ${socket.id} joined call room: ${appointmentId}`);
        socket.to(appointmentId).emit('user-joined', socket.id);
    });

    socket.on('offer', ({ to, offer }) => {
        socket.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
        socket.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
            if (room !== socket.id) {
                socket.to(room).emit('user-left', socket.id);
            }
        });
        console.log('User disconnecting, notified rooms');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Export io to be used in controllers
global.io = io;

const startReminderService = require('./utils/reminderService');
startReminderService();

const mongooseOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

const connectWithRetry = () => {
    console.log('Attempting MongoDB connection...');
    mongoose
        .connect(MONGODB_URI, mongooseOptions)
        .then(async () => {
            console.log('Connected to MongoDB');

            // Automatic Seeding for Phase 5
            try {
                const Product = require('./models/Product');
                const productCount = await Product.countDocuments();
                if (productCount === 0) {
                    const products = [
                        { name: 'Paracetamol 500mg', description: 'Used for pain relief and fever.', price: 45, category: 'OTC', stock: 100, manufacturer: 'HealthCorp', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Multivitamin Gold', description: 'Daily essential nutrients for vitality.', price: 550, category: 'Supplements', stock: 200, manufacturer: 'NutriBio', image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Digital Thermometer', description: 'High precision digital readings.', price: 299, category: 'Equipment', stock: 30, manufacturer: 'TechMed', image: 'https://images.unsplash.com/photo-1543333995-a78ee3e5f999?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Blood Pressure Monitor', description: 'Automatic wrist BP monitor with memory.', price: 1850, category: 'Equipment', stock: 15, manufacturer: 'Omron', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=500&auto=format&fit=crop&q=60' },
                        { name: 'Omega-3 Fish Oil', description: 'Heart and brain health support.', price: 799, category: 'Supplements', stock: 50, manufacturer: 'NatureMade', image: 'https://images.unsplash.com/photo-1550572017-ed20bb022646?w=500&auto=format&fit=crop&q=60' }
                    ];
                    await Product.insertMany(products);
                    console.log('Pharmacy database seeded successfully');
                }
            } catch (seedErr) {
                console.error('Seeding error:', seedErr);
            }
        })
        .catch((err) => {
            console.error('MongoDB connection error, retrying in 5 seconds...', err.message);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

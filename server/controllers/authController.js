const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, shopName, specialization } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            shopName: role === 'pharmacy' ? shopName : undefined,
            specialization: role === 'doctor' ? specialization : undefined,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: user.shopName,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc Get all doctors
// @route GET /api/auth/doctors
exports.getDoctors = async (req, res) => {
    try {
        const { search, specialization } = req.query;
        let query = { role: 'doctor' };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (specialization) {
            query.specialization = specialization;
        }

        const doctors = await User.find(query).select('-password');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get current user profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.bio = req.body.bio || user.bio;
            user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
            user.address = req.body.address || user.address;
            user.gender = req.body.gender || user.gender;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;

            if (user.role === 'doctor') {
                user.specialization = req.body.specialization || user.specialization;
                user.qualifications = req.body.qualifications || user.qualifications;
            }

            if (user.role === 'pharmacy') {
                user.shopName = req.body.shopName || user.shopName;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                bio: updatedUser.bio,
                bloodGroup: updatedUser.bloodGroup,
                address: updatedUser.address,
                gender: updatedUser.gender,
                dateOfBirth: updatedUser.dateOfBirth,
                specialization: updatedUser.specialization,
                qualifications: updatedUser.qualifications,
                shopName: updatedUser.shopName,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc Get doctor by ID
// @route GET /api/auth/doctors/:id
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Upload profile image
// @route POST /api/auth/profile/image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user._id);
        if (user) {
            user.profileImage = `/uploads/${req.file.filename}`;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                profileImage: updatedUser.profileImage
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

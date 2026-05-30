const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const sendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            user,
        },
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const newUser = await User.create({
            name,
            email,
            password,
            role,
        });

        sendResponse(newUser, 201, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password',
            });
        }

        sendResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

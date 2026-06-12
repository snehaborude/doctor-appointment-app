const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

exports.getAllDoctors = async (req, res) => {
    try {
        const { search, specialization } = req.query;
        let query = {};
        
        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }
        
        let profiles = await DoctorProfile.find(query).populate('user', 'name email role');
        
        // If there's a search term, filter by doctor's name
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            profiles = profiles.filter(profile => 
                profile.user && searchRegex.test(profile.user.name)
            );
        }
        
        res.status(200).json({
            success: true,
            count: profiles.length,
            data: { profiles },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const profile = await DoctorProfile.findOne({ user: req.params.id }).populate('user', 'name email role');
        
        if (!profile) {
            // Check if the user is a doctor but just doesn't have a profile yet
            const user = await User.findOne({ _id: req.params.id, role: 'doctor' });
            if (user) {
                return res.status(200).json({
                    success: true,
                    data: {
                        profile: {
                            user,
                            specialization: '',
                            experience: 0,
                            fees: 0,
                            bio: '',
                            availability: []
                        }
                    }
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }
        
        res.status(200).json({
            success: true,
            data: { profile },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { specialization, experience, fees, bio, availability } = req.body;
        
        let profile = await DoctorProfile.findOne({ user: req.user._id });
        
        if (profile) {
            profile.specialization = specialization !== undefined ? specialization : profile.specialization;
            profile.experience = experience !== undefined ? experience : profile.experience;
            profile.fees = fees !== undefined ? fees : profile.fees;
            profile.bio = bio !== undefined ? bio : profile.bio;
            profile.availability = availability !== undefined ? availability : profile.availability;
            await profile.save();
        } else {
            profile = await DoctorProfile.create({
                user: req.user._id,
                specialization,
                experience,
                fees,
                bio,
                availability,
            });
        }
        
        res.status(200).json({
            success: true,
            data: { profile },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

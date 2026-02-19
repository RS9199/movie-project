const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    watchlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    }],
    watchedMovies: [{
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        },
        rating: {
            type: Number,
            min: 1,
            max: 10
        },
        watchedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
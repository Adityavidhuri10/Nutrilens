import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  GENDERS,
  ACTIVITY_LEVELS,
  DIETARY_PREFERENCES,
  ACTIVITY_MULTIPLIERS,
} from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    profile: {
      age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [13, 'Must be at least 13 years old'],
        max: [120, 'Invalid age'],
      },

      gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
          values: GENDERS,
          message: 'Gender must be one of: male, female, other',
        },
      },

      height: {
        type: Number,
        required: [true, 'Height is required'],
        min: [50, 'Height must be at least 50 cm'],
        max: [300, 'Height cannot exceed 300 cm'],
      },

      weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg'],
      },

      activityLevel: {
        type: String,
        required: [true, 'Activity level is required'],
        enum: {
          values: ACTIVITY_LEVELS,
          message: `Activity level must be one of: ${ACTIVITY_LEVELS.join(', ')}`,
        },
      },

      dietaryPreference: {
        type: String,
        enum: {
          values: DIETARY_PREFERENCES,
          message: `Dietary preference must be one of: ${DIETARY_PREFERENCES.join(', ')}`,
        },
        default: 'none',
      },
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
userSchema.index({ createdAt: -1 });

// ─── Pre-save Hook: Hash Password ────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
 */
userSchema.methods.calculateBMR = function () {
  const { weight, height, age, gender } = this.profile;

  const base = 10 * weight + 6.25 * height - 5 * age;

  return Math.round(gender === 'female' ? base - 161 : base + 5);
};

/**
 * Calculate Total Daily Energy Expenditure.
 */
userSchema.methods.calculateTDEE = function () {
  const bmr = this.calculateBMR();

  const multiplier =
    ACTIVITY_MULTIPLIERS[this.profile.activityLevel] || 1.55;

  return Math.round(bmr * multiplier);
};

const User = mongoose.model('User', userSchema);

export default User;
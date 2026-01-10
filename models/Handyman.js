import mongoose from 'mongoose';

/**
 * Handyman Profile Schema
 * Extended profile for handymen with skills, pricing, and location
 */
const handymanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skillCategories: [
      {
        type: String,
        required: true,
        // Allow both predefined categories and custom skills
        // Predefined categories for validation and consistency
        // Custom skills allow flexibility for unique services
        validate: {
          validator: function(value) {
            const predefinedCategories = [
              'Electrical',
              'Plumbing',
              'Painting',
              'Carpentry',
              'Appliance Repair',
              'General Maintenance',
              'HVAC',
              'Phone Repair',
              'TV Repair',
              'Computer Repair',
              'AC Repair',
              'Washing Machine Repair',
              'Refrigerator Repair',
              'Furniture Assembly',
              'Home Cleaning',
              'Garden Maintenance',
            ];
            // Allow predefined categories or custom skills (non-empty string)
            return predefinedCategories.includes(value) || (typeof value === 'string' && value.trim().length > 0);
          },
          message: 'Skill category must be a predefined category or a valid custom skill name',
        },
      },
    ],
    experience: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: 0,
    },
    serviceDescription: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    basePrice: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
      validate: {
        validator: function(value) {
          // If priceType is "in_agreement", basePrice can be 0 or undefined
          if (this.priceType === 'in_agreement') {
            return value >= 0;
          }
          // Otherwise, basePrice must be greater than 0
          return value > 0;
        },
        message: 'Base price must be greater than 0 when price type is not "in_agreement"',
      },
    },
    priceType: {
      type: String,
      enum: ['per_hour', 'per_job', 'in_agreement'],
      default: 'per_hour',
    },
    availability: {
      days: [
        {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
      ],
      hours: {
        start: {
          type: String,
          default: '08:00',
        },
        end: {
          type: String,
          default: '18:00',
        },
      },
    },
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude] for GeoJSON
        index: '2dsphere',
      },
      areaName: {
        type: String,
        required: [true, 'Area name is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON index for location-based queries
handymanSchema.index({ 'location.coordinates': '2dsphere' });

// Index for skill categories
handymanSchema.index({ skillCategories: 1 });

// Index for active and verified handymen
handymanSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for calculating completion rate
handymanSchema.virtual('completionRate').get(function () {
  if (this.totalJobs === 0) return 0;
  return ((this.completedJobs / this.totalJobs) * 100).toFixed(1);
});

export default mongoose.model('Handyman', handymanSchema);


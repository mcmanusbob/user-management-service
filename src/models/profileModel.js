const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  avatar: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Avatar must be a valid image URL'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  timezone: {
    type: String,
    default: 'UTC',
    validate: {
      validator: function(v) {
        // Basic timezone validation
        return /^[A-Z][a-z]+\/[A-Z][a-z_]+$|^UTC$/.test(v);
      },
      message: 'Invalid timezone format'
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v);
        },
        message: 'Invalid LinkedIn URL'
      }
    },
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/.test(v);
        },
        message: 'Invalid GitHub URL'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/.test(v);
        },
        message: 'Invalid Twitter URL'
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Invalid website URL'
      }
    }
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience seems unrealistic']
    }
  }],
  interests: [{
    type: String,
    trim: true,
    maxlength: [50, 'Interest cannot exceed 50 characters']
  }],
  experience: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Institution name cannot exceed 100 characters']
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [20, 'Grade cannot exceed 20 characters']
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v > this.issueDate;
        },
        message: 'Expiry date must be after issue date'
      }
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters']
    },
    credentialUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid credential URL'
      }
    }
  }],
  learningGoals: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Goal title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Goal description cannot exceed 500 characters']
    },
    targetDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v > new Date();
        },
        message: 'Target date must be in the future'
      }
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'paused'],
      default: 'not_started'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ 'skills.name': 1 });
profileSchema.index({ interests: 1 });
profileSchema.index({ isPublic: 1 });

// Calculate profile completeness
profileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const fields = [
    'bio', 'avatar', 'phone', 'dateOfBirth', 'country', 'city',
    'skills', 'interests', 'experience', 'education'
  ];
  
  fields.forEach(field => {
    if (this[field]) {
      if (Array.isArray(this[field])) {
        score += this[field].length > 0 ? 10 : 0;
      } else {
        score += 10;
      }
    }
  });
  
  this.profileCompleteness = Math.min(score, 100);
  return this.profileCompleteness;
};

// Pre-save middleware to calculate completeness
profileSchema.pre('save', function(next) {
  this.calculateCompleteness();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learningPreferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    },
    preferredLanguages: [{
      type: String,
      trim: true,
      maxlength: [50, 'Language cannot exceed 50 characters']
    }],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
      default: 'beginner'
    },
    learningPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast', 'adaptive'],
      default: 'moderate'
    },
    preferredContentTypes: [{
      type: String,
      enum: ['video', 'text', 'interactive', 'audio', 'quiz', 'project'],
      default: ['video', 'text']
    }],
    sessionDuration: {
      type: Number,
      min: [5, 'Session duration must be at least 5 minutes'],
      max: [480, 'Session duration cannot exceed 8 hours'],
      default: 30
    },
    dailyGoal: {
      type: Number,
      min: [5, 'Daily goal must be at least 5 minutes'],
      max: [480, 'Daily goal cannot exceed 8 hours'],
      default: 60
    }
  },
  notificationPreferences: {
    email: {
      weeklyProgress: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false }
    },
    push: {
      dailyReminder: { type: Boolean, default: true },
      achievementUnlocked: { type: Boolean, default: true },
      assignmentDue: { type: Boolean, default: true },
      liveSession: { type: Boolean, default: true },
      messageReceived: { type: Boolean, default: true }
    },
    inApp: {
      realTimeFeedback: { type: Boolean, default: true },
      progressUpdates: { type: Boolean, default: true },
      socialActivity: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true }
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'connections'
    },
    showProgress: { type: Boolean, default: true },
    showAchievements: { type: Boolean, default: true },
    allowMessages: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    dataCollection: {
      analytics: { type: Boolean, default: true },
      personalization: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },
  accessibilitySettings: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    screenReader: { type: Boolean, default: false },
    keyboardNavigation: { type: Boolean, default: false },
    closedCaptions: { type: Boolean, default: false },
    audioDescriptions: { type: Boolean, default: false }
  },
  interfacePreferences: {
    language: {
      type: String,
      default: 'en',
      match: [/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code']
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      default: 'USD',
      match: [/^[A-Z]{3}$/, 'Invalid currency code']
    },
    numberFormat: {
      type: String,
      enum: ['1,234.56', '1.234,56', '1 234,56'],
      default: '1,234.56'
    }
  },
  studySchedule: {
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTimes: [{
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      }
    }],
    timezone: {
      type: String,
      default: 'UTC'
    },
    reminderTime: {
      type: Number,
      min: [5, 'Reminder time must be at least 5 minutes'],
      max: [1440, 'Reminder time cannot exceed 24 hours'],
      default: 30
    }
  },
  contentFilters: {
    topics: [{
      name: String,
      include: Boolean
    }],
    contentRating: {
      type: String,
      enum: ['all', 'beginner-friendly', 'mature'],
      default: 'all'
    },
    language: [{
      type: String,
      trim: true
    }],
    instructorPreferences: [{
      instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      preference: {
        type: String,
        enum: ['preferred', 'blocked']
      }
    }]
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
preferencesSchema.index({ userId: 1 }, { unique: true });
preferencesSchema.index({ 'learningPreferences.preferredLanguages': 1 });
preferencesSchema.index({ 'studySchedule.preferredDays': 1 });

// Method to get notification preferences for a specific type
preferencesSchema.methods.getNotificationSetting = function(type, setting) {
  if (!this.notificationPreferences[type]) {
    return false;
  }
  return this.notificationPreferences[type][setting] || false;
};

// Method to update specific preference
preferencesSchema.methods.updatePreference = function(category, setting, value) {
  if (!this[category]) {
    this[category] = {};
  }
  this[category][setting] = value;
  return this.save();
};

// Static method to get default preferences
preferencesSchema.statics.getDefaultPreferences = function() {
  return {
    learningPreferences: {
      learningStyle: 'visual',
      preferredLanguages: ['English'],
      difficultyLevel: 'beginner',
      learningPace: 'moderate',
      preferredContentTypes: ['video', 'text'],
      sessionDuration: 30,
      dailyGoal: 60
    },
    notificationPreferences: {
      email: {
        weeklyProgress: true,
        courseUpdates: true,
        assignments: true,
        achievements: true,
        reminders: true,
        promotions: false,
        newsletter: false
      },
      push: {
        dailyReminder: true,
        achievementUnlocked: true,
        assignmentDue: true,
        liveSession: true,
        messageReceived: true
      },
      inApp: {
        realTimeFeedback: true,
        progressUpdates: true,
        socialActivity: true,
        systemAnnouncements: true
      }
    },
    privacySettings: {
      profileVisibility: 'connections',
      showProgress: true,
      showAchievements: true,
      allowMessages: true,
      showOnlineStatus: true,
      dataCollection: {
        analytics: true,
        personalization: true,
        marketing: false
      }
    }
  };
};

module.exports = mongoose.model('Preferences', preferencesSchema);
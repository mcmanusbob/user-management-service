const Joi = require('joi');

class Validator {
  validateRegistration(data) {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name cannot be empty',
          'string.max': 'First name cannot exceed 50 characters',
          'any.required': 'First name is required'
        }),
      lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name cannot be empty',
          'string.max': 'Last name cannot exceed 50 characters',
          'any.required': 'Last name is required'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateLogin(data) {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateEmail(data) {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validatePasswordReset(data) {
    const schema = Joi.object({
      token: Joi.string()
        .required()
        .messages({
          'any.required': 'Reset token is required'
        }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validatePasswordChange(data) {
    const schema = Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          'any.required': 'Current password is required'
        }),
      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'New password must be at least 8 characters long',
          'string.max': 'New password cannot exceed 128 characters',
          'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'New password is required'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateProfileUpdate(data) {
    const schema = Joi.object({
      bio: Joi.string().max(500).allow(''),
      avatar: Joi.string().uri().allow(''),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow(''),
      dateOfBirth: Joi.date().max('now'),
      country: Joi.string().max(100).allow(''),
      city: Joi.string().max(100).allow(''),
      timezone: Joi.string().allow(''),
      socialLinks: Joi.object({
        linkedin: Joi.string().uri().allow(''),
        github: Joi.string().uri().allow(''),
        twitter: Joi.string().uri().allow(''),
        website: Joi.string().uri().allow('')
      }),
      interests: Joi.array().items(Joi.string().max(50)),
      isPublic: Joi.boolean()
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateSkill(data) {
    const schema = Joi.object({
      name: Joi.string()
        .trim()
        .max(50)
        .required()
        .messages({
          'any.required': 'Skill name is required',
          'string.max': 'Skill name cannot exceed 50 characters'
        }),
      level: Joi.string()
        .valid('beginner', 'intermediate', 'advanced', 'expert')
        .required()
        .messages({
          'any.required': 'Skill level is required',
          'any.only': 'Skill level must be one of: beginner, intermediate, advanced, expert'
        }),
      yearsOfExperience: Joi.number()
        .min(0)
        .max(50)
        .messages({
          'number.min': 'Years of experience cannot be negative',
          'number.max': 'Years of experience seems unrealistic'
        })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateExperience(data) {
    const schema = Joi.object({
      title: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
          'any.required': 'Job title is required',
          'string.max': 'Job title cannot exceed 100 characters'
        }),
      company: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
          'any.required': 'Company name is required',
          'string.max': 'Company name cannot exceed 100 characters'
        }),
      startDate: Joi.date()
        .required()
        .messages({
          'any.required': 'Start date is required'
        }),
      endDate: Joi.date()
        .greater(Joi.ref('startDate'))
        .allow(null)
        .messages({
          'date.greater': 'End date must be after start date'
        }),
      description: Joi.string().max(1000).allow(''),
      isCurrent: Joi.boolean()
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validatePreferences(data) {
    const schema = Joi.object({
      learningPreferences: Joi.object({
        learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading'),
        preferredLanguages: Joi.array().items(Joi.string().max(50)),
        difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'mixed'),
        learningPace: Joi.string().valid('slow', 'moderate', 'fast', 'adaptive'),
        preferredContentTypes: Joi.array().items(
          Joi.string().valid('video', 'text', 'interactive', 'audio', 'quiz', 'project')
        ),
        sessionDuration: Joi.number().min(5).max(480),
        dailyGoal: Joi.number().min(5).max(480)
      }),
      notificationPreferences: Joi.object().pattern(
        Joi.string(),
        Joi.object().pattern(Joi.string(), Joi.boolean())
      ),
      privacySettings: Joi.object({
        profileVisibility: Joi.string().valid('public', 'connections', 'private'),
        showProgress: Joi.boolean(),
        showAchievements: Joi.boolean(),
        allowMessages: Joi.boolean(),
        showOnlineStatus: Joi.boolean(),
        dataCollection: Joi.object({
          analytics: Joi.boolean(),
          personalization: Joi.boolean(),
          marketing: Joi.boolean()
        })
      }),
      accessibilitySettings: Joi.object({
        fontSize: Joi.string().valid('small', 'medium', 'large', 'extra-large'),
        theme: Joi.string().valid('light', 'dark', 'auto'),
        highContrast: Joi.boolean(),
        reducedMotion: Joi.boolean(),
        screenReader: Joi.boolean(),
        keyboardNavigation: Joi.boolean(),
        closedCaptions: Joi.boolean(),
        audioDescriptions: Joi.boolean()
      })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateLearningPreferences(data) {
    const schema = Joi.object({
      learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading'),
      preferredLanguages: Joi.array().items(Joi.string().max(50)),
      difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'mixed'),
      learningPace: Joi.string().valid('slow', 'moderate', 'fast', 'adaptive'),
      preferredContentTypes: Joi.array().items(
        Joi.string().valid('video', 'text', 'interactive', 'audio', 'quiz', 'project')
      ),
      sessionDuration: Joi.number().min(5).max(480),
      dailyGoal: Joi.number().min(5).max(480)
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateNotificationPreferences(data) {
    const schema = Joi.object().pattern(
      Joi.string(),
      Joi.object().pattern(Joi.string(), Joi.boolean())
    );

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validatePrivacySettings(data) {
    const schema = Joi.object({
      profileVisibility: Joi.string().valid('public', 'connections', 'private'),
      showProgress: Joi.boolean(),
      showAchievements: Joi.boolean(),
      allowMessages: Joi.boolean(),
      showOnlineStatus: Joi.boolean(),
      dataCollection: Joi.object({
        analytics: Joi.boolean(),
        personalization: Joi.boolean(),
        marketing: Joi.boolean()
      })
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  validateAccessibilitySettings(data) {
    const schema = Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large', 'extra-large'),
      theme: Joi.string().valid('light', 'dark', 'auto'),
      highContrast: Joi.boolean(),
      reducedMotion: Joi.boolean(),
      screenReader: Joi.boolean(),
      keyboardNavigation: Joi.boolean(),
      closedCaptions: Joi.boolean(),
      audioDescriptions: Joi.boolean()
    });

    const { error } = schema.validate(data, { abortEarly: false });
    return error ? error.details.map(detail => detail.message) : [];
  }

  // Generic validation for MongoDB ObjectId
  validateObjectId(id) {
    const schema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
    const { error } = schema.validate(id);
    return !error;
  }

  // Validate pagination parameters
  validatePagination(data) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    });

    const { error, value } = schema.validate(data);
    return { errors: error ? error.details.map(detail => detail.message) : [], value };
  }
}

module.exports = new Validator();
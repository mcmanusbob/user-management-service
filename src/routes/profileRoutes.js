const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware.authenticate);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.get('/stats', profileController.getUserStats);

// Skills routes
router.post('/skills', profileController.addSkill);
router.put('/skills/:skillId', profileController.updateSkill);
router.delete('/skills/:skillId', profileController.removeSkill);

// Experience routes
router.post('/experience', profileController.addExperience);
router.put('/experience/:experienceId', profileController.updateExperience);
router.delete('/experience/:experienceId', profileController.removeExperience);

module.exports = router;
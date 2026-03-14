const express = require('express');
const router = express.Router();
const authorityController = require('../controllers/authorityController');
const { authMiddleware } = require('../middleware/auth');

// Public or Protected routes based on design
router.get('/', authorityController.getAllAuthorities);
router.post('/', authorityController.saveAuthorities);
router.delete('/:id', authorityController.deleteAuthority);

module.exports = router;

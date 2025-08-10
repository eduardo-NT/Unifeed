const express = require('express');
const typeformController = require('../controllers/typeform/typeformController');

const router = express.Router();

/**
 * Typeform Routes
 * Handles fetching and normalizing Typeform data
 */

// Get form responses with normalization and batch processing
// GET /typeform/responses/:formId?userId=xxx&pageSize=1000&includeRaw=false&includeSummary=false&useBatchProcessing=true&incrementalOnly=false&batchSize=150
router.get('/responses/:formId', typeformController.getResponses);

// Get list of user's forms
// GET /typeform/forms?userId=xxx&page=1&pageSize=200
router.get('/forms', typeformController.getForms);

// Get specific form details
// GET /typeform/forms/:formId?userId=xxx
router.get('/forms/:formId', typeformController.getFormDetails);

// Test normalization with sample data
// GET /typeform/test-normalization/:formId?userId=xxx
router.get('/test-normalization/:formId', typeformController.testNormalization);

module.exports = router;
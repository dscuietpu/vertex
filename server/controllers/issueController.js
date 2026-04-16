const path = require('path');
const Issue = require('../models/Issue');
const { analyseImage } = require('../utils/aiDescriptionGenerator');
const { checkDuplicate } = require('../utils/duplicateDetector');

// ─── POST /api/issues ─────────────────────────────────────────────────────────
/**
 * Upload a new civic issue with image, generate AI description,
 * check for duplicates (and increment their counter), classify priority,
 * and save to DB.
 */
async function createIssue(req, res) {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location (latitude & longitude) is required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates provided' });
    }

    // Build image URL (relative path served statically)
    const imageUrl = `/uploads/${req.file.filename}`;
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    // 1. Generate AI description, priority, and category via single LLaMA 4 call
    console.log('🤖 Generating AI analysis...');
    const { description, priority, category } = await analyseImage(imagePath);
    console.log(`📝 Result: "${description}" | Priority: ${priority} | Category: ${category}`);

    // 2. Check for duplicates
    console.log('🔍 Checking for duplicates...');
    const { duplicate, matchedIssue } = await checkDuplicate(description, lat, lon);

    if (duplicate && matchedIssue) {
      // ── Duplicate: increment reportCount on the original issue ──────────────
      const newCount = (matchedIssue.reportCount || 1) + 1;
      const updatedIssue = await Issue.findByIdAndUpdate(
        matchedIssue._id,
        { $inc: { reportCount: 1 } },
        { new: true }
      );

      // Also save this submission as a linked duplicate record (keeps image)
      const duplicateRecord = new Issue({
        imageUrl,
        description,
        latitude: lat,
        longitude: lon,
        priority: matchedIssue.priority,
        category: matchedIssue.category || category,
        status: matchedIssue.status,
        duplicateOf: matchedIssue._id,
        reportCount: 1,
      });
      await duplicateRecord.save();

      console.log(
        `📊 Report count for issue ${matchedIssue._id} incremented to ${newCount}`
      );

      return res.status(200).json({
        message: `This issue has already been reported. It has now been reported ${newCount} time${newCount !== 1 ? 's' : ''}.`,
        duplicate: true,
        reportCount: newCount,
        originalIssue: updatedIssue,
        duplicateRecord,
      });
    }

    // 3. Save to MongoDB
    const issue = new Issue({
      imageUrl,
      description,
      latitude: lat,
      longitude: lon,
      priority,
      category,
      status: 'Pending',
      reportCount: 1,
    });

    await issue.save();
    console.log(`✅ Issue saved: ${issue._id}`);

    return res.status(201).json({
      message: 'Issue reported successfully!',
      duplicate: false,
      issue,
    });
  } catch (error) {
    console.error('❌ createIssue error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// ─── GET /api/issues ──────────────────────────────────────────────────────────
/**
 * Fetch all non-duplicate (original) issues with optional search/filter query params.
 * Query params: search, priority, status
 */
async function getAllIssues(req, res) {
  try {
    const { search, priority, status, includeDuplicates } = req.query;
    const filter = {};

    // By default only return original issues (not duplicate records)
    if (includeDuplicates !== 'true') {
      filter.duplicateOf = null;
    }

    if (priority && priority !== 'All') filter.priority = priority;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const issues = await Issue.find(filter).sort({ reportCount: -1, createdAt: -1 });
    return res.json({ issues, total: issues.length });
  } catch (error) {
    console.error('❌ getAllIssues error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── PUT /api/issues/:id ──────────────────────────────────────────────────────
/**
 * Update issue status (Pending → In Progress → Resolved).
 */
async function updateIssueStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const issue = await Issue.findByIdAndUpdate(id, { status }, { new: true });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    return res.json({ message: 'Status updated successfully', issue });
  } catch (error) {
    console.error('❌ updateIssueStatus error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── GET /api/issues/heatmap ──────────────────────────────────────────────────
/**
 * Return lightweight coordinate data for heatmap visualization.
 * Uses reportCount as intensity multiplier.
 */
async function getHeatmapData(req, res) {
  try {
    const issues = await Issue.find(
      { duplicateOf: null },
      'latitude longitude priority reportCount -_id'
    );

    const heatmapPoints = issues.map((issue) => ({
      lat: issue.latitude,
      lng: issue.longitude,
      // Intensity: priority weight × report count (capped at 10)
      intensity:
        (issue.priority === 'High' ? 3 : issue.priority === 'Medium' ? 2 : 1) *
        Math.min(issue.reportCount || 1, 10),
    }));

    return res.json({ points: heatmapPoints });
  } catch (error) {
    console.error('❌ getHeatmapData error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createIssue, getAllIssues, updateIssueStatus, getHeatmapData };

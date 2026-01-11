import express from 'express';
import { userSessions } from './auth.js';
import {
    createJobSheet,
    getJobs,
    addJob,
    updateJob,
    deleteJob
} from '../services/sheets.service.js';

const router = express.Router();

/**
 * Middleware to check authentication
 */
function requireAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    req.session = userSessions.get(sessionId);
    next();
}

/**
 * POST /api/jobs/init
 * Initialize Google Sheet for user
 */
router.post('/init', requireAuth, async (req, res) => {
    try {
        const { tokens } = req.session;

        // Check if sheet already exists
        if (req.session.sheetId) {
            return res.json({
                sheetId: req.session.sheetId,
                message: 'Sheet already initialized'
            });
        }

        // Create new sheet
        const sheetId = await createJobSheet(tokens);
        req.session.sheetId = sheetId;
        console.log(`📊 Sheet initialized for session ${req.headers['x-session-id']}: ${sheetId}`);

        res.json({
            sheetId,
            message: 'Job tracking sheet created successfully',
            url: `https://docs.google.com/spreadsheets/d/${sheetId}`
        });
    } catch (error) {
        console.error('Sheet initialization error:', error);
        res.status(500).json({ error: 'Failed to initialize sheet' });
    }
});

/**
 * GET /api/jobs
 * Get all jobs
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const { tokens, sheetId } = req.session;

        if (!sheetId) {
            console.warn(`⚠️ Attempted to fetch jobs for session without sheetId: ${sessionId}`);
            return res.status(400).json({
                error: 'Sheet not initialized',
                needsInit: true
            });
        }

        console.log(`🔍 Fetching jobs for sheet: ${sheetId}`);
        const jobs = await getJobs(tokens, sheetId);

        // Apply filters if provided
        let filteredJobs = jobs;

        if (req.query.status) {
            filteredJobs = filteredJobs.filter(job =>
                job.status === req.query.status
            );
        }

        if (req.query.search) {
            const searchLower = req.query.search.toLowerCase();
            filteredJobs = filteredJobs.filter(job =>
                job.company.toLowerCase().includes(searchLower) ||
                job.job_title.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        const sortBy = req.query.sort || 'date_applied';
        const order = req.query.order || 'desc';

        filteredJobs.sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            return order === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });

        res.json({
            jobs: filteredJobs,
            total: filteredJobs.length
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: 'Failed to retrieve jobs' });
    }
});

/**
 * POST /api/jobs
 * Add new job
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const { tokens, sheetId } = req.session;

        if (!sheetId) {
            return res.status(400).json({
                error: 'Sheet not initialized',
                needsInit: true
            });
        }

        // Validate required fields
        const { company, job_title, job_url } = req.body;

        if (!company || !job_title || !job_url) {
            return res.status(400).json({
                error: 'Missing required fields: company, job_title, job_url'
            });
        }

        console.log(`📥 Saving new job to sheet ${sheetId}: ${company} - ${job_title}`);
        const result = await addJob(tokens, sheetId, req.body);

        console.log(`✅ Job save result:`, result);
        res.status(result.created ? 201 : 200).json(result);
    } catch (error) {
        console.error('Add job error:', error);
        res.status(500).json({ error: 'Failed to add job' });
    }
});

/**
 * PATCH /api/jobs/:id
 * Update job
 */
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { tokens, sheetId } = req.session;
        const { id } = req.params;

        if (!sheetId) {
            return res.status(400).json({
                error: 'Sheet not initialized',
                needsInit: true
            });
        }

        const result = await updateJob(tokens, sheetId, id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Update job error:', error);

        if (error.message === 'Job not found') {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(500).json({ error: 'Failed to update job' });
    }
});

/**
 * DELETE /api/jobs/:id
 * Delete job
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { tokens, sheetId } = req.session;
        const { id } = req.params;

        if (!sheetId) {
            return res.status(400).json({
                error: 'Sheet not initialized',
                needsInit: true
            });
        }

        const result = await deleteJob(tokens, sheetId, id);
        res.json(result);
    } catch (error) {
        console.error('Delete job error:', error);

        if (error.message === 'Job not found') {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(500).json({ error: 'Failed to delete job' });
    }
});

/**
 * GET /api/jobs/stats
 * Get job statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const { tokens, sheetId } = req.session;

        if (!sheetId) {
            return res.status(400).json({
                error: 'Sheet not initialized',
                needsInit: true
            });
        }

        const jobs = await getJobs(tokens, sheetId);

        // Calculate statistics
        const stats = {
            total: jobs.length,
            by_status: {},
            this_week: 0,
            this_month: 0
        };

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        jobs.forEach(job => {
            // Count by status
            stats.by_status[job.status] = (stats.by_status[job.status] || 0) + 1;

            // Count recent applications
            const appliedDate = new Date(job.date_applied);
            if (appliedDate >= weekAgo) stats.this_week++;
            if (appliedDate >= monthAgo) stats.this_month++;
        });

        // Calculate response rate
        const responded = (stats.by_status['Interview'] || 0) +
            (stats.by_status['Offer'] || 0) +
            (stats.by_status['Rejected'] || 0);
        stats.response_rate = stats.total > 0 ? responded / stats.total : 0;

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
});

export default router;

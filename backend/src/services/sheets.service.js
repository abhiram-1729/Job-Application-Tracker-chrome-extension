import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedClient } from './auth.service.js';

const SHEET_NAME = 'Job Applications';
const HEADERS = [
    'id',
    'company',
    'job_title',
    'job_url',
    'status',
    'date_applied',
    'date_updated',
    'source',
    'location',
    'salary_range',
    'notes',
    'follow_up_date',
    'contact_person',
    'contact_email'
];

/**
 * Create a new Google Sheet for job tracking
 */
export async function createJobSheet(tokens) {
    const auth = getAuthenticatedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    try {
        // Search for existing spreadsheet first
        console.log('🔍 Searching for existing tracker spreadsheet...');
        const listResponse = await drive.files.list({
            q: "name = 'Job Application Tracker' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        let spreadsheetId;
        const files = listResponse.data.files;

        if (files && files.length > 0) {
            spreadsheetId = files[0].id;
            console.log(`✅ Found existing spreadsheet: ${spreadsheetId}`);
            return spreadsheetId;
        }

        // Create new spreadsheet if not found
        console.log('🔨 Creating new tracker spreadsheet...');
        const createResponse = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: 'Job Application Tracker'
                },
                sheets: [{
                    properties: {
                        title: SHEET_NAME,
                        gridProperties: {
                            frozenRowCount: 1 // Freeze header row
                        }
                    }
                }]
            }
        });

        spreadsheetId = createResponse.data.spreadsheetId;
        const firstSheet = createResponse.data.sheets[0];
        const sheetId = firstSheet.properties.sheetId;

        // Add headers
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!A1:N1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [HEADERS]
            }
        });

        // Format headers (bold, background color)
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId: sheetId,
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                                    textFormat: {
                                        foregroundColor: { red: 1, green: 1, blue: 1 },
                                        bold: true
                                    }
                                }
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    },
                    // Add data validation for status column (E)
                    {
                        setDataValidation: {
                            range: {
                                sheetId: sheetId,
                                startRowIndex: 1,
                                startColumnIndex: 4,
                                endColumnIndex: 5
                            },
                            rule: {
                                condition: {
                                    type: 'ONE_OF_LIST',
                                    values: [
                                        { userEnteredValue: 'Applied' },
                                        { userEnteredValue: 'Interview' },
                                        { userEnteredValue: 'Offer' },
                                        { userEnteredValue: 'Rejected' },
                                        { userEnteredValue: 'Ghosted' }
                                    ]
                                },
                                showCustomUi: true
                            }
                        }
                    }
                ]
            }
        });

        console.log(`✅ Created sheet: ${spreadsheetId}`);
        return spreadsheetId;
    } catch (error) {
        console.error('Error creating sheet:', error);
        throw new Error('Failed to create job tracking sheet');
    }
}

/**
 * Get all jobs from the sheet
 */
export async function getJobs(tokens, spreadsheetId) {
    const auth = getAuthenticatedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A2:N` // Skip header row
        });

        const rows = response.data.values || [];

        return rows.map(row => ({
            id: row[0] || '',
            company: row[1] || '',
            job_title: row[2] || '',
            job_url: row[3] || '',
            status: row[4] || 'Saved',
            date_applied: row[5] || '',
            date_updated: row[6] || '',
            source: row[7] || '',
            location: row[8] || '',
            salary_range: row[9] || '',
            notes: row[10] || '',
            follow_up_date: row[11] || '',
            contact_person: row[12] || '',
            contact_email: row[13] || ''
        }));
    } catch (error) {
        console.error('Error getting jobs:', error);
        throw new Error('Failed to retrieve jobs from sheet');
    }
}

/**
 * Add a new job to the sheet
 */
export async function addJob(tokens, spreadsheetId, jobData) {
    const auth = getAuthenticatedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const id = uuidv4();
        const now = new Date().toISOString();

        // Check for duplicates first
        const existingJobs = await getJobs(tokens, spreadsheetId);
        const duplicate = findDuplicate(jobData, existingJobs);

        if (duplicate) {
            // Upsert: If the new status is "Applied" and existing is "Saved", update it
            if (jobData.status === 'Applied' && duplicate.status === 'Saved') {
                console.log(`🔄 Upserting job ${duplicate.id} from Saved to Applied`);
                const updated = await updateJob(tokens, spreadsheetId, duplicate.id, {
                    status: 'Applied',
                    date_applied: jobData.date_applied || now.split('T')[0]
                });
                return {
                    ...updated,
                    upserted: true,
                    message: 'Existing job updated to Applied'
                };
            }

            return {
                created: false,
                duplicate: true,
                existing_id: duplicate.id,
                message: 'Job already exists in your tracker'
            };
        }

        const row = [
            id,
            jobData.company || '',
            jobData.job_title || '',
            jobData.job_url || '',
            jobData.status || 'Saved',
            jobData.status === 'Applied' ? (jobData.date_applied || now.split('T')[0]) : '',
            now,
            jobData.source || '',
            jobData.location || '',
            jobData.salary_range || '',
            jobData.notes || '',
            jobData.follow_up_date || '',
            jobData.contact_person || '',
            jobData.contact_email || ''
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${SHEET_NAME}!A:N`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row]
            }
        });

        return {
            created: true,
            duplicate: false,
            id,
            message: 'Job added successfully'
        };
    } catch (error) {
        console.error('Error adding job:', error);
        throw new Error('Failed to add job to sheet');
    }
}

/**
 * Update an existing job
 */
export async function updateJob(tokens, spreadsheetId, jobId, updates) {
    const auth = getAuthenticatedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Find the row with this job ID
        const jobs = await getJobs(tokens, spreadsheetId);
        const jobIndex = jobs.findIndex(job => job.id === jobId);

        if (jobIndex === -1) {
            throw new Error('Job not found');
        }

        const rowNumber = jobIndex + 2; // +2 because of header and 0-indexing
        const job = jobs[jobIndex];

        // Merge updates with existing data
        const updatedJob = {
            ...job,
            ...updates,
            date_updated: new Date().toISOString()
        };

        const row = [
            updatedJob.id,
            updatedJob.company,
            updatedJob.job_title,
            updatedJob.job_url,
            updatedJob.status,
            updatedJob.date_applied,
            updatedJob.date_updated,
            updatedJob.source,
            updatedJob.location,
            updatedJob.salary_range,
            updatedJob.notes,
            updatedJob.follow_up_date,
            updatedJob.contact_person,
            updatedJob.contact_email
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!A${rowNumber}:N${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row]
            }
        });

        return {
            updated: true,
            id: jobId,
            message: 'Job updated successfully'
        };
    } catch (error) {
        console.error('Error updating job:', error);
        throw new Error('Failed to update job');
    }
}

/**
 * Delete a job
 */
export async function deleteJob(tokens, spreadsheetId, jobId) {
    const auth = getAuthenticatedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetId = spreadsheet.data.sheets[0].properties.sheetId;

        const jobs = await getJobs(tokens, spreadsheetId);
        const jobIndex = jobs.findIndex(job => job.id === jobId);

        if (jobIndex === -1) {
            throw new Error('Job not found');
        }

        const rowNumber = jobIndex + 2;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowNumber - 1,
                            endIndex: rowNumber
                        }
                    }
                }]
            }
        });

        return {
            deleted: true,
            id: jobId,
            message: 'Job deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting job:', error);
        throw new Error('Failed to delete job');
    }
}

/**
 * Find duplicate job based on normalized company, title, and URL
 */
function findDuplicate(newJob, existingJobs) {
    const normalized = normalizeForDedup(newJob);

    return existingJobs.find(existing => {
        const existingNorm = normalizeForDedup(existing);

        // Match on company + title OR exact URL
        const companyTitleMatch =
            normalized.company === existingNorm.company &&
            normalized.title === existingNorm.title;

        const urlMatch = normalized.url === existingNorm.url;

        return companyTitleMatch || urlMatch;
    });
}

/**
 * Normalize job data for deduplication
 */
function normalizeForDedup(job) {
    const company = (job.company || '')
        .toLowerCase()
        .replace(/\b(inc|llc|ltd|corp|corporation|company)\b\.?/g, '')
        .trim();

    const title = (job.job_title || '').toLowerCase().trim();

    let url = '';
    try {
        const urlObj = new URL(job.job_url || '');
        // Preserve key parameters for job boards
        const searchParams = urlObj.searchParams;
        const importantParams = ['jk', 'vjk', 'currentJobId', 'id', 'jobId'];
        const preservedParams = new URLSearchParams();

        importantParams.forEach(param => {
            if (searchParams.has(param)) {
                preservedParams.set(param, searchParams.get(param));
            }
        });

        const paramsStr = preservedParams.toString();
        url = urlObj.origin + urlObj.pathname + (paramsStr ? '?' + paramsStr : '');
    } catch {
        url = job.job_url || '';
    }

    return { company, title, url };
}

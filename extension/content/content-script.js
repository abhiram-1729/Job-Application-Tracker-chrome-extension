(function () {
    const DEBUG_TAG = '🚀 [JobTracker]';
    console.log('%c' + DEBUG_TAG + ' SCRIPT LOADED', 'background: #667eea; color: white; padding: 4px; border-radius: 4px;');

    const PATTERNS = {
        indeed: /indeed\./i,
        internshala: /internshala\.com/i,
        linkedin: /linkedin\.com/i,
        unstop: /unstop\.com/i,
        iimjobs: /iimjobs\.com|hirist\.tech/i,
        foundit: /foundit\.in|monsterindia\.com/i
    };

    const extractorUtils = {
        sel(s) {
            const el = document.querySelector(s);
            return el ? el.textContent.trim() : null;
        },
        clean(text) {
            return text ? text.replace(/\s+/g, ' ').trim() : '';
        }
    };

    function detectBoard() {
        const url = window.location.href;
        for (const [name, regex] of Object.entries(PATTERNS)) {
            if (regex.test(url)) return name;
        }
        return null;
    }

    function extractIndeed() {
        console.log(DEBUG_TAG + ' Extracting Indeed details...');
        const title = extractorUtils.sel('h1[data-testid="jobsearch-JobInfoHeader-title"]') ||
            extractorUtils.sel('.jobsearch-JobInfoHeader-title') ||
            extractorUtils.sel('.jobsearch-Job-title') ||
            document.title.split('-')[0];

        const company = extractorUtils.sel('[data-testid="inlineHeader-companyName"]') ||
            extractorUtils.sel('.jobsearch-InlineCompanyRating-companyHeader a') ||
            extractorUtils.sel('[data-testid="company-name"]') ||
            extractorUtils.sel('.jobsearch-CompanyReview--heading') ||
            extractorUtils.sel('.icl-u-lg-mr--sm.icl-u-xs-mr--xs') ||
            'Unknown Company';

        const location = extractorUtils.sel('[data-testid="inlineHeader-companyLocation"]') ||
            extractorUtils.sel('.jobsearch-JobInfoHeader-subtitle div:last-child') ||
            '';

        // Normalize Indeed URL to use 'jk' or 'vjk' parameter if present
        let jobUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const jk = urlParams.get('jk') || urlParams.get('vjk');
        if (jk) {
            jobUrl = `${window.location.origin}/viewjob?jk=${jk}`;
        }

        return {
            company: extractorUtils.clean(company),
            job_title: extractorUtils.clean(title),
            job_url: jobUrl,
            source: 'indeed',
            location: extractorUtils.clean(location)
        };
    }

    function extractInternshala() {
        console.log(DEBUG_TAG + ' Extracting Internshala details...');
        const title = extractorUtils.sel('.profile_on_detail_page') ||
            extractorUtils.sel('.heading_4_5') ||
            extractorUtils.sel('.job-title-container') ||
            extractorUtils.sel('h1') ||
            'Unknown Position';

        const company = extractorUtils.sel('.company_and_premium .link_display_like_text') ||
            extractorUtils.sel('.company_name_container .link_display_like_text') ||
            extractorUtils.sel('.company_name') ||
            extractorUtils.sel('.heading_6') ||
            extractorUtils.sel('.company-name-container') ||
            'Unknown Company';

        const location = extractorUtils.sel('#location_names') ||
            extractorUtils.sel('.location_link') ||
            extractorUtils.sel('.location_names') ||
            '';

        // Clean Internshala URL (remove utm_source etc)
        const url = new URL(window.location.href);
        const cleanUrl = url.origin + url.pathname;

        return {
            company: extractorUtils.clean(company),
            job_title: extractorUtils.clean(title),
            job_url: cleanUrl,
            source: 'internshala',
            location: extractorUtils.clean(location)
        };
    }

    function extractUnstop() {
        console.log(DEBUG_TAG + ' Extracting Unstop details...');
        const title = extractorUtils.sel('h1') ||
            extractorUtils.sel('.opportunity_title') ||
            document.title.split('|')[0];

        const company = extractorUtils.sel('h2') ||
            extractorUtils.sel('.organisation_name') ||
            extractorUtils.sel('.company_name') ||
            'Unknown Company';

        const location = extractorUtils.sel('.detail-tab') ||
            extractorUtils.sel('.location') ||
            extractorUtils.sel('div.my_sect .d-flex.flex-row span') ||
            '';

        return {
            company: extractorUtils.clean(company),
            job_title: extractorUtils.clean(title),
            job_url: window.location.href.split('?')[0],
            source: 'unstop',
            location: extractorUtils.clean(location)
        };
    }

    function extractLinkedIn() {
        console.log(DEBUG_TAG + ' Extracting LinkedIn details...');

        // Comprehensive Title Selectors
        const title = extractorUtils.sel('.job-details-jobs-unified-top-card__job-title') ||
            extractorUtils.sel('.jobs-unified-top-card__job-title') ||
            extractorUtils.sel('.top-card-layout__title') ||
            extractorUtils.sel('h1') ||
            extractorUtils.sel('h2.job-details-jobs-unified-top-card__job-title') ||
            document.title.split('|')[0].split('-')[0];

        // Comprehensive Company Selectors
        let company = extractorUtils.sel('.job-details-jobs-unified-top-card__company-name') ||
            extractorUtils.sel('.jobs-unified-top-card__company-name') ||
            extractorUtils.sel('.topcard__org-name-link') ||
            extractorUtils.sel('.topcard__flavor--black-link') ||
            extractorUtils.sel('.jobs-details-top-card__company-url');

        // Fallback: search for company links in the top card area
        if (!company || company === 'Unknown Company') {
            const topCard = document.querySelector('.job-details-jobs-unified-top-card') ||
                document.querySelector('.jobs-unified-top-card') ||
                document.querySelector('.top-card-layout');
            if (topCard) {
                const companyLink = topCard.querySelector('a[href*="/company/"]');
                if (companyLink) company = companyLink.textContent;
            }
        }

        // Comprehensive Location Selectors
        const location = extractorUtils.sel('.job-details-jobs-unified-top-card__primary-description span:first-child') ||
            extractorUtils.sel('.job-details-jobs-unified-top-card__bullet') ||
            extractorUtils.sel('.jobs-unified-top-card__bullet') ||
            extractorUtils.sel('.topcard__flavor--bullet') ||
            '';

        // Robust URL Normalization
        let jobUrl = window.location.href.split('?')[0];
        const urlParams = new URLSearchParams(window.location.search);
        const currentJobId = urlParams.get('currentJobId') || urlParams.get('jobs-details-top-card__job-id');

        if (currentJobId && !jobUrl.includes('/view/')) {
            jobUrl = `https://www.linkedin.com/jobs/view/${currentJobId}`;
        } else if (jobUrl.includes('/jobs/search/')) {
            // If we're on a search page and no jobId in URL, try to find it in the DOM
            const activeJob = document.querySelector('.jobs-search-results-list__list-item--active') ||
                document.querySelector('.jobs-search-results-list__list-item[data-occludable-job-id]');
            if (activeJob) {
                const id = activeJob.getAttribute('data-job-id') || activeJob.getAttribute('data-occludable-job-id');
                if (id) jobUrl = `https://www.linkedin.com/jobs/view/${id}`;
            }
        }

        return {
            company: extractorUtils.clean(company || 'Unknown Company'),
            job_title: extractorUtils.clean(title || 'Unknown Position').replace('| LinkedIn', ''),
            job_url: jobUrl,
            source: 'linkedin',
            location: extractorUtils.clean(location)
        };
    }

    function extractIIMJobs() {
        console.log(DEBUG_TAG + ' Extracting IIMJobs details...');
        const title = extractorUtils.sel('h1') || extractorUtils.sel('.job-title') || document.title.split('-')[0];
        const company = extractorUtils.sel('.company-name') || extractorUtils.sel('.job-header-info a') || 'Unknown Company';
        const location = extractorUtils.sel('.location') || '';

        return {
            company: extractorUtils.clean(company),
            job_title: extractorUtils.clean(title),
            job_url: window.location.href.split('?')[0],
            source: 'iimjobs',
            location: extractorUtils.clean(location)
        };
    }

    function extractFoundit() {
        console.log(DEBUG_TAG + ' Extracting Foundit details...');
        const title = extractorUtils.sel('.job-title') || extractorUtils.sel('h1') || document.title;
        const company = extractorUtils.sel('.company-name') || extractorUtils.sel('.jd-top-head a') || 'Unknown Company';
        const location = extractorUtils.sel('.location') || '';

        return {
            company: extractorUtils.clean(company),
            job_title: extractorUtils.clean(title),
            job_url: window.location.href.split('?')[0],
            source: 'foundit',
            location: extractorUtils.clean(location)
        };
    }

    const ApplicationDetector = {
        lastAppliedUrl: null,

        check() {
            const board = detectBoard();
            if (!board) return;

            const html = document.body.innerText;
            const url = window.location.href;

            const successPatterns = {
                linkedin: [
                    /Application submitted/i,
                    /Your application was sent/i,
                    /Application sent to/i,
                    /saved to your applied jobs/i
                ],
                indeed: [
                    /Application submitted/i,
                    /Your application has been submitted/i,
                    /\/hiring\/post-apply/i.test(url)
                ],
                internshala: [
                    /Applied successfully/i,
                    /You have already applied/i
                ],
                unstop: [
                    /Successfully Applied/i,
                    /Application Submitted/i
                ],
                iimjobs: [
                    /Successfully Applied/i,
                    /You have already applied/i
                ],
                foundit: [
                    /Successfully Applied/i,
                    /Applied/i
                ],
                generic: [
                    /Application submitted/i,
                    /Successfully applied/i,
                    /Thank you for applying/i,
                    /Your application has been received/i
                ]
            };

            const patterns = successPatterns[board] || successPatterns.generic;
            const isSuccess = patterns.some(p => typeof p === 'boolean' ? p : p.test(html));

            if (isSuccess && this.lastAppliedUrl !== url) {
                console.log(DEBUG_TAG + ' Application detected!');
                this.lastAppliedUrl = url;
                this.triggerAutoSave(board || 'generic');
            }
        },

        triggerAutoSave(board) {
            let data;
            try {
                if (board === 'indeed') data = extractIndeed();
                else if (board === 'internshala') data = extractInternshala();
                else if (board === 'linkedin') data = extractLinkedIn();
                else if (board === 'unstop') data = extractUnstop();
                else if (board === 'iimjobs') data = extractIIMJobs();
                else if (board === 'foundit') data = extractFoundit();
                else {
                    // Generic extraction
                    data = {
                        company: extractorUtils.clean(extractorUtils.sel('h2') || 'Unknown Company'),
                        job_title: extractorUtils.clean(document.title.split('|')[0].split('-')[0]),
                        job_url: window.location.href.split('?')[0],
                        source: window.location.hostname.replace('www.', '').split('.')[0],
                        location: ''
                    };
                }

                if (!data || !data.job_title || data.job_title === 'Unknown Position') return;

                data.status = 'Applied';
                data.date_applied = new Date().toISOString().split('T')[0];

                chrome.runtime.sendMessage({ type: 'SAVE_JOB', data }, (res) => {
                    if (res?.success) {
                        console.log(DEBUG_TAG + ' Auto-saved application:', data.job_title);
                    }
                });
            } catch (err) {
                console.error(DEBUG_TAG + ' Auto-save error:', err);
            }
        }
    };

    function createUI(board) {
        const HOST_ID = 'job-tracker-host';
        if (document.getElementById(HOST_ID)) return;

        const host = document.createElement('div');
        host.id = HOST_ID;
        host.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 2147483647;';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `
            .pivot {
                width: 36px; height: 36px;
                background: #1e293b;
                border-radius: 10px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: white;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.2s ease;
            }
            .pivot:hover { 
                transform: translateY(-2px);
                background: #334155;
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
            }
            .menu {
                position: absolute; bottom: 48px; right: 0;
                background: white; border-radius: 12px; padding: 8px;
                display: none; flex-direction: column; gap: 4px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.12); width: 180px;
                border: 1px solid #edf2f7;
            }
            .btn {
                padding: 10px 12px; border-radius: 8px; cursor: pointer;
                font-family: -apple-system, system-ui, sans-serif; font-size: 13px; font-weight: 500;
                border: none; background: transparent; color: #4a5568; text-align: left;
                transition: all 0.15s ease; display: flex; align-items: center; gap: 8px;
            }
            .btn:hover { background: #f1f5f9; color: #1e293b; }
            .btn-loading { color: #64748b; cursor: default; }
            .btn-success { color: #10b981; }
            .btn-info { color: #3b82f6; }
            .btn-error { color: #ef4444; }
            
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .spinner { animation: spin 1s linear infinite; }
        `;
        shadow.appendChild(style);

        const pivot = document.createElement('div');
        pivot.className = 'pivot';
        pivot.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
        `;

        const menu = document.createElement('div');
        menu.className = 'menu';

        pivot.onclick = (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        };

        const addBtn = (text, status) => {
            const b = document.createElement('button');
            b.className = 'btn'; b.innerText = text;

            const setFeedback = (html, className, duration = 2000) => {
                b.innerHTML = html;
                b.className = `btn ${className}`;
                if (duration) {
                    setTimeout(() => {
                        b.innerText = text;
                        b.className = 'btn';
                        if (className === 'btn-success') menu.style.display = 'none';
                    }, duration);
                }
            };

            b.onclick = async (e) => {
                e.stopPropagation();

                setFeedback(`
                    <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                    Saving...
                `, 'btn-loading', 0);

                let data;
                try {
                    if (board === 'indeed') data = extractIndeed();
                    else if (board === 'internshala') data = extractInternshala();
                    else if (board === 'linkedin') data = extractLinkedIn();
                    else if (board === 'unstop') data = extractUnstop();
                    else if (board === 'iimjobs') data = extractIIMJobs();
                    else if (board === 'foundit') data = extractFoundit();

                    if (!data) throw new Error('Extraction failed');

                    data.status = status;
                    if (status === 'Applied') data.date_applied = new Date().toISOString().split('T')[0];

                    console.log(DEBUG_TAG + ' Sending Data:', data);

                    chrome.runtime.sendMessage({ type: 'SAVE_JOB', data }, (res) => {
                        if (res?.success) {
                            if (res.data?.duplicate && !res.data?.upserted) {
                                setFeedback(`
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
                                    Already Added
                                `, 'btn-info');
                            } else {
                                setFeedback(`
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Saved
                                `, 'btn-success');
                            }
                        } else {
                            setFeedback(`
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                Error
                            `, 'btn-error', 3000);
                        }
                    });
                } catch (err) {
                    setFeedback(`
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 2 19 19"></path><path d="M20 16a8 8 0 1 0-13.3 5.9"></path><path d="m11 19 3 3 3-3"></path></svg>
                        Retry
                    `, 'btn-error', 3000);
                    console.error(DEBUG_TAG + ' Extraction error:', err);
                }
            };
            return b;
        };

        menu.appendChild(addBtn('Mark as Applied', 'Applied'));
        menu.appendChild(addBtn('Save for Later', 'Saved'));
        shadow.appendChild(menu);
        shadow.appendChild(pivot);
    }

    setInterval(() => {
        const board = detectBoard();
        if (board) {
            createUI(board);
            ApplicationDetector.check();
        } else {
            const h = document.getElementById('job-tracker-host');
            if (h) h.remove();
        }
    }, 2000);

    // Initial check
    const b = detectBoard();
    if (b) {
        createUI(b);
        ApplicationDetector.check();
    }
})();

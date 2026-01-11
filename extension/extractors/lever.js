import { BaseExtractor } from './base.js';

/**
 * Lever job page extractor
 */
class LeverExtractor extends BaseExtractor {
    extract() {
        const company = this.getCompany();
        const jobTitle = this.getJobTitle();
        const location = this.getLocation();

        return {
            company,
            job_title: jobTitle,
            job_url: window.location.href.split('?')[0],
            source: 'lever',
            location,
            date_applied: new Date().toISOString().split('T')[0]
        };
    }

    getCompany() {
        // Extract from URL: jobs.lever.co/company-name/...
        const urlMatch = window.location.pathname.match(/^\/([^\/]+)/);
        if (urlMatch) {
            return this.cleanText(urlMatch[1].replace(/-/g, ' '));
        }

        return this.trySelectors([
            '.main-header-text',
            'header h2',
            '.company-name'
        ]) || this.getMetaContent('og:site_name') || 'Unknown Company';
    }

    getJobTitle() {
        return this.trySelectors([
            '.posting-headline h2',
            'h2[class*="posting-headline"]',
            '.posting-title'
        ]) || this.getMetaContent('og:title') || 'Unknown Position';
    }

    getLocation() {
        return this.trySelectors([
            '.sort-by-location',
            '.posting-categories .location',
            'div.location'
        ]) || '';
    }
}

export function extract() {
    const extractor = new LeverExtractor();
    return extractor.extract();
}

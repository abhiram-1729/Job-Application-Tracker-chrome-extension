import { BaseExtractor } from './base.js';

/**
 * Greenhouse job page extractor
 */
class GreenhouseExtractor extends BaseExtractor {
    extract() {
        const company = this.getCompany();
        const jobTitle = this.getJobTitle();
        const location = this.getLocation();

        return {
            company,
            job_title: jobTitle,
            job_url: window.location.href.split('?')[0],
            source: 'greenhouse',
            location,
            date_applied: new Date().toISOString().split('T')[0]
        };
    }

    getCompany() {
        // Company name is usually in the URL or page title
        const urlMatch = window.location.hostname.match(/boards\.greenhouse\.io/);
        if (urlMatch) {
            const pathParts = window.location.pathname.split('/');
            return this.cleanText(pathParts[1]) || 'Unknown Company';
        }

        return this.trySelectors([
            '.company-name',
            'header h1',
            '.app-title'
        ]) || this.getMetaContent('og:site_name') || 'Unknown Company';
    }

    getJobTitle() {
        return this.trySelectors([
            '.app-title',
            'h1.app-title',
            'h1[class*="title"]'
        ]) || this.getMetaContent('og:title') || 'Unknown Position';
    }

    getLocation() {
        return this.trySelectors([
            '.location',
            'div.location',
            'span.location'
        ]) || '';
    }
}

export function extract() {
    const extractor = new GreenhouseExtractor();
    return extractor.extract();
}

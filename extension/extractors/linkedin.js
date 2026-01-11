import { BaseExtractor } from './base.js';

/**
 * LinkedIn job page extractor
 */
class LinkedInExtractor extends BaseExtractor {
    extract() {
        const company = this.getCompany();
        const jobTitle = this.getJobTitle();
        const location = this.getLocation();

        return {
            company,
            job_title: jobTitle,
            job_url: window.location.href.split('?')[0], // Remove query params
            source: 'linkedin',
            location,
            date_applied: new Date().toISOString().split('T')[0]
        };
    }

    getCompany() {
        return this.trySelectors([
            '.job-details-jobs-unified-top-card__company-name',
            '.topcard__org-name-link',
            '.jobs-unified-top-card__company-name a',
            'a.ember-view.t-black.t-normal'
        ]) || this.getMetaContent('og:site_name') || 'Unknown Company';
    }

    getJobTitle() {
        return this.trySelectors([
            '.job-details-jobs-unified-top-card__job-title',
            '.topcard__title',
            '.jobs-unified-top-card__job-title h1',
            'h1.t-24.t-bold'
        ]) || this.getMetaContent('og:title') || 'Unknown Position';
    }

    getLocation() {
        return this.trySelectors([
            '.job-details-jobs-unified-top-card__bullet',
            '.topcard__flavor--bullet',
            '.jobs-unified-top-card__bullet'
        ]) || '';
    }
}

export function extract() {
    const extractor = new LinkedInExtractor();
    return extractor.extract();
}

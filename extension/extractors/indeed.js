import { BaseExtractor } from './base.js';

/**
 * Indeed job page extractor
 */
class IndeedExtractor extends BaseExtractor {
    extract() {
        const company = this.getCompany();
        const jobTitle = this.getJobTitle();
        const location = this.getLocation();
        const salary = this.getSalary();

        return {
            company,
            job_title: jobTitle,
            job_url: window.location.href.split('?')[0],
            source: 'indeed',
            location,
            salary_range: salary,
            date_applied: new Date().toISOString().split('T')[0]
        };
    }

    getCompany() {
        return this.trySelectors([
            '[data-company-name="true"]',
            '.jobsearch-InlineCompanyRating-companyHeader a',
            '.jobsearch-CompanyInfoContainer a',
            'div[data-testid="inlineHeader-companyName"] a'
        ]) || 'Unknown Company';
    }

    getJobTitle() {
        return this.trySelectors([
            '.jobsearch-JobInfoHeader-title',
            'h1.icl-u-xs-mb--xs',
            'h1[class*="jobsearch-JobInfoHeader"]'
        ]) || this.getMetaContent('og:title') || 'Unknown Position';
    }

    getLocation() {
        return this.trySelectors([
            '[data-testid="inlineHeader-companyLocation"]',
            '.jobsearch-JobInfoHeader-subtitle div',
            'div[class*="jobsearch-JobInfoHeader-subtitle"]'
        ]) || '';
    }

    getSalary() {
        return this.trySelectors([
            '#salaryInfoAndJobType',
            '.jobsearch-JobMetadataHeader-item',
            'div[id="salaryGuide"]'
        ]) || '';
    }
}

export function extract() {
    const extractor = new IndeedExtractor();
    return extractor.extract();
}

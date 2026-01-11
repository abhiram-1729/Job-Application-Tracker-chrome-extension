/**
 * Base extractor class with common utilities
 */
export class BaseExtractor {
    /**
     * Try multiple CSS selectors in order
     */
    trySelectors(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        return null;
    }

    /**
     * Try to get content from meta tags
     */
    getMetaContent(property) {
        const meta = document.querySelector(`meta[property="${property}"]`) ||
            document.querySelector(`meta[name="${property}"]`);
        return meta ? meta.getAttribute('content') : null;
    }

    /**
     * Clean text (remove extra whitespace, newlines)
     */
    cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    /**
     * Extract domain from URL
     */
    getDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return '';
        }
    }
}

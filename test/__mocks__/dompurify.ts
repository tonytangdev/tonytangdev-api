export default function DOMPurify() {
  return {
    sanitize: (
      dirty: string,
      config?: {
        ALLOWED_TAGS?: string[];
        ALLOWED_ATTR?: string[];
        ALLOW_DATA_ATTR?: boolean;
      },
    ) => {
      // Basic sanitization mock for testing
      let cleaned = dirty;

      // Remove script tags
      cleaned = cleaned.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '',
      );

      // Remove event handlers
      cleaned = cleaned.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
      cleaned = cleaned.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');

      // Remove data attributes if ALLOW_DATA_ATTR is false
      if (config?.ALLOW_DATA_ATTR === false) {
        cleaned = cleaned.replace(/\s*data-[\w-]+\s*=\s*"[^"]*"/gi, '');
        cleaned = cleaned.replace(/\s*data-[\w-]+\s*=\s*'[^']*'/gi, '');
      }

      // Remove style tags
      cleaned = cleaned.replace(
        /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
        '',
      );

      // Remove iframe tags
      cleaned = cleaned.replace(
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        '',
      );

      // Filter allowed tags if specified
      if (config?.ALLOWED_TAGS) {
        const allowedTags = config.ALLOWED_TAGS;
        // Remove tags not in the allowed list (simple implementation)
        // This is a simplified version - doesn't handle all edge cases
        const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        cleaned = cleaned.replace(tagPattern, (match, tagName: string) => {
          if (allowedTags.includes(tagName.toLowerCase())) {
            return match;
          }
          return '';
        });
      }

      return cleaned;
    },
  };
}

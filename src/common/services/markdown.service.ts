import { Injectable } from '@nestjs/common';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

@Injectable()
export class MarkdownService {
  private readonly markedInstance: typeof marked;
  private readonly purify: ReturnType<typeof createDOMPurify>;

  constructor() {
    this.markedInstance = marked.setOptions({
      gfm: true,
      breaks: true,
    });

    const window = new JSDOM('').window;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.purify = createDOMPurify(window as any);
  }

  renderMarkdown(markdown: string): string {
    try {
      const rawHtml = this.markedInstance.parse(markdown) as string;

      const sanitizedHtml = this.purify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'strong',
          'em',
          'code',
          'pre',
          'ul',
          'ol',
          'li',
          'blockquote',
          'a',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'del',
          'input',
          'hr',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'type',
          'checked',
          'disabled',
        ],
        ALLOW_DATA_ATTR: false,
      });

      return sanitizedHtml;
    } catch {
      return this.escapeHtml(markdown);
    }
  }

  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
  }
}

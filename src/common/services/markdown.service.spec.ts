import { Test, TestingModule } from '@nestjs/testing';
import { MarkdownService } from './markdown.service';

jest.mock('jsdom');
jest.mock('dompurify');

describe('MarkdownService', () => {
  let service: MarkdownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkdownService],
    }).compile();

    service = module.get<MarkdownService>(MarkdownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('renderMarkdown', () => {
    describe('basic markdown features', () => {
      it('should render headings', () => {
        const markdown = '# H1\n## H2\n### H3';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<h1>H1</h1>');
        expect(html).toContain('<h2>H2</h2>');
        expect(html).toContain('<h3>H3</h3>');
      });

      it('should render bold text', () => {
        const markdown = 'This is **bold** text';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<strong>bold</strong>');
      });

      it('should render italic text', () => {
        const markdown = 'This is *italic* text';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<em>italic</em>');
      });

      it('should render links', () => {
        const markdown = '[Google](https://google.com)';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<a href="https://google.com">Google</a>');
      });

      it('should render images', () => {
        const markdown = '![Alt text](https://example.com/image.png)';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<img');
        expect(html).toContain('src="https://example.com/image.png"');
        expect(html).toContain('alt="Alt text"');
      });

      it('should render unordered lists', () => {
        const markdown = '- Item 1\n- Item 2\n- Item 3';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<ul>');
        expect(html).toContain('<li>Item 1</li>');
        expect(html).toContain('<li>Item 2</li>');
        expect(html).toContain('</ul>');
      });

      it('should render ordered lists', () => {
        const markdown = '1. First\n2. Second\n3. Third';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<ol>');
        expect(html).toContain('<li>First</li>');
        expect(html).toContain('<li>Second</li>');
        expect(html).toContain('</ol>');
      });

      it('should render blockquotes', () => {
        const markdown = '> This is a quote';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<blockquote>');
        expect(html).toContain('This is a quote');
        expect(html).toContain('</blockquote>');
      });

      it('should render inline code', () => {
        const markdown = 'Use `console.log()` for debugging';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<code>console.log()</code>');
      });

      it('should render code blocks', () => {
        const markdown = '```typescript\nconst x = 42;\n```';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<pre>');
        expect(html).toContain('<code');
        expect(html).toContain('const x = 42;');
        expect(html).toContain('</code>');
        expect(html).toContain('</pre>');
      });

      it('should render horizontal rules', () => {
        const markdown = '---';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<hr');
      });
    });

    describe('GitHub Flavored Markdown features', () => {
      it('should render tables', () => {
        const markdown = '| Col1 | Col2 |\n|------|------|\n| A    | B    |';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<table>');
        expect(html).toContain('<thead>');
        expect(html).toContain('<tbody>');
        expect(html).toContain('<tr>');
        expect(html).toContain('<th>');
        expect(html).toContain('<td>');
        expect(html).toContain('Col1');
        expect(html).toContain('Col2');
        expect(html).toContain('>A<');
        expect(html).toContain('>B<');
      });

      it('should render task lists', () => {
        const markdown = '- [x] Completed\n- [ ] Incomplete';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<input');
        expect(html).toContain('type="checkbox"');
        expect(html).toContain('checked');
        expect(html).toContain('disabled');
      });

      it('should render strikethrough', () => {
        const markdown = '~~deleted text~~';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<del>deleted text</del>');
      });

      it('should support line breaks with GFM', () => {
        const markdown = 'Line 1\nLine 2';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('Line 1');
        expect(html).toContain('Line 2');
      });
    });

    describe('XSS prevention', () => {
      it('should remove script tags', () => {
        const markdown = '<script>alert("XSS")</script>Safe text';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('<script>');
        expect(html).not.toContain('alert');
        expect(html).toContain('Safe text');
      });

      it('should remove event handlers', () => {
        const markdown = '<img src="x" onerror="alert(1)" />';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('onerror');
        expect(html).not.toContain('alert');
      });

      it('should remove onclick handlers', () => {
        const markdown = '<a href="#" onclick="alert(1)">Click</a>';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('onclick');
        expect(html).not.toContain('alert');
      });

      it('should remove data attributes', () => {
        const markdown = '<div data-secret="password">Text</div>';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('data-secret');
        expect(html).not.toContain('password');
      });

      it('should remove style tags', () => {
        const markdown = '<style>body { display: none; }</style>';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('<style>');
        expect(html).not.toContain('display: none');
      });

      it('should remove iframe tags', () => {
        const markdown = '<iframe src="https://evil.com"></iframe>';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('<iframe');
        expect(html).not.toContain('evil.com');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const html = service.renderMarkdown('');
        expect(html).toBe('');
      });

      it('should handle plain text without markdown', () => {
        const plainText = 'Just plain text';
        const html = service.renderMarkdown(plainText);

        expect(html).toContain('Just plain text');
      });

      it('should handle very long text', () => {
        const longText = 'a'.repeat(10000);
        const html = service.renderMarkdown(longText);

        expect(html).toBeDefined();
        expect(html.length).toBeGreaterThan(0);
      });

      it('should handle special characters', () => {
        const markdown = '< > & " \'';
        const html = service.renderMarkdown(markdown);

        expect(html).toBeDefined();
        expect(html.length).toBeGreaterThan(0);
      });

      it('should handle mixed markdown and HTML', () => {
        const markdown = '**Bold** <strong>HTML Bold</strong>';
        const html = service.renderMarkdown(markdown);

        expect(html).toContain('<strong>Bold</strong>');
        expect(html).toContain('<strong>HTML Bold</strong>');
      });
    });

    describe('error handling', () => {
      it('should not throw on malformed markdown', () => {
        const malformed = '**unclosed bold';

        expect(() => service.renderMarkdown(malformed)).not.toThrow();
        const html = service.renderMarkdown(malformed);
        expect(html).toBeDefined();
      });
    });

    describe('security - no header IDs', () => {
      it('should not generate id attributes on headings', () => {
        const markdown = '# Heading with spaces';
        const html = service.renderMarkdown(markdown);

        expect(html).not.toContain('id=');
      });
    });
  });
});

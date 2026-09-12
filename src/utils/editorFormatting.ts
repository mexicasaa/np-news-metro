/**
 * Utilities for formatting article text and pasted content in the editor.
 * Preserves exact original spacing, indentation, and alignment without injecting
 * unwanted blank lines between lines of the same paragraph.
 */

/**
 * Formats article text for clean paragraph presentation:
 * - Normalizes Windows CRLF to standard Unix LF (\n).
 * - Preserves single newlines within paragraphs so multi-line sentences stay together.
 * - Preserves double newlines (\n\n) between distinct paragraphs.
 * - Collapses excessive blank lines (3 or more newlines become \n\n).
 * - Trims trailing whitespace from each line while maintaining indentation and structure.
 */
export const formatArticleText = (text: string): string => {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trim()) return '';

  // Trim trailing whitespace from each line without destroying leading indent/spacing
  const lines = normalized.split('\n');
  const cleanedLines = lines.map(line => line.trimEnd());
  
  // Collapse 3+ consecutive newlines to standard double newlines (\n\n)
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

/**
 * Safely converts rich HTML into clean text/markdown while strictly preserving paragraph
 * integrity and preventing broken asterisk clusters or unwanted line gaps.
 */
export const convertHtmlToEditorMarkdown = (html: string): string => {
  if (!html || !html.trim()) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unwanted non-content elements
    doc.querySelectorAll(
      'script, style, noscript, iframe, svg, button, form, nav, header, footer, [aria-hidden="true"]'
    ).forEach(el => el.remove());

    const serializeNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'strong' || tag === 'b') {
        const text = Array.from(el.childNodes).map(serializeNode).join('');
        return text.trim() ? `**${text.trim()}**` : text;
      }
      if (tag === 'em' || tag === 'i') {
        const text = Array.from(el.childNodes).map(serializeNode).join('');
        return text.trim() ? `*${text.trim()}*` : text;
      }
      if (tag === 'a') {
        const text = Array.from(el.childNodes).map(serializeNode).join('').trim();
        const href = el.getAttribute('href');
        if (text && href && !href.startsWith('javascript:')) {
          return `[${text}](${href})`;
        }
        return text;
      }
      if (tag === 'br') {
        return '\n';
      }
      if (tag === 'img') {
        const src = el.getAttribute('src');
        const alt = el.getAttribute('alt') || 'Photo';
        if (src && !src.startsWith('data:')) {
          return `\n\n![${alt}](${src})\n\n`;
        }
        return '';
      }

      return Array.from(el.childNodes).map(serializeNode).join('');
    };

    const blocks: string[] = [];

    const processBlockElement = (el: HTMLElement) => {
      const tag = el.tagName.toLowerCase();

      if (tag === 'h1' || tag === 'h2') {
        const text = serializeNode(el).trim();
        if (text) blocks.push(`## ${text}`);
        return;
      }
      if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        const text = serializeNode(el).trim();
        if (text) blocks.push(`### ${text}`);
        return;
      }
      if (tag === 'blockquote') {
        const text = serializeNode(el).trim();
        if (text) blocks.push(`> "${text.replace(/^["']|["']$/g, '')}"`);
        return;
      }
      if (tag === 'ul' || tag === 'ol') {
        const items: string[] = [];
        el.querySelectorAll('li').forEach(li => {
          const itemText = serializeNode(li).trim();
          if (itemText) items.push(`- ${itemText}`);
        });
        if (items.length > 0) {
          blocks.push(items.join('\n'));
        }
        return;
      }
      if (tag === 'p') {
        const text = serializeNode(el).trim();
        if (text) blocks.push(text);
        return;
      }

      // For containers like div, section, article
      const hasBlockChildren = el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote');
      if (hasBlockChildren) {
        Array.from(el.children).forEach(child => {
          if (child instanceof HTMLElement) {
            processBlockElement(child);
          }
        });
      } else {
        const text = serializeNode(el).trim();
        if (text) blocks.push(text);
      }
    };

    Array.from(doc.body.children).forEach(child => {
      if (child instanceof HTMLElement) {
        processBlockElement(child);
      }
    });

    if (blocks.length > 0) {
      return blocks.filter(b => b && b.trim()).join('\n\n');
    }
  } catch (err) {
    console.warn('HTML paste conversion fallback:', err);
  }
  return '';
};

/**
 * Unified paste formatter:
 * Strictly prioritizes plain text to preserve the EXACT spacing, indentation, line breaks,
 * and alignment of copied content without introducing unexpected blank lines or mangled characters.
 */
export const formatPastedContent = (html?: string, plain?: string): string => {
  if (typeof plain === 'string' && plain.length > 0) {
    // Normalize Windows CRLF line endings to standard LF while preserving exact spaces, indents, and newlines
    return plain.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  if (html && html.trim()) {
    const formattedHtml = convertHtmlToEditorMarkdown(html);
    if (formattedHtml && formattedHtml.trim()) {
      return formattedHtml.trim();
    }
  }

  return '';
};

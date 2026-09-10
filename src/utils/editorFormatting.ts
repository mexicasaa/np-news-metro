/**
 * Utilities for formatting article text and rich HTML pasted into the editor.
 * Ensures paragraphs are separated by clean double-newlines (\n\n) and bullet lists stay intact.
 */

/**
 * Formats plain text to ensure proper paragraph spacing between lines.
 * If text only has single newlines between paragraphs, expands them to double newlines.
 * If text already has double newlines, preserves them and collapses excessive spacing.
 */
export const formatArticleText = (text: string): string => {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return '';

  // Case 1: Text already has double newlines (paragraphs separated by blank lines)
  if (/\n\s*\n/.test(normalized)) {
    return normalized
      .split(/\n\s*\n/)
      .map(block => block.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  // Case 2: Text has multiple single newlines without double newlines
  const rawLines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  if (rawLines.length <= 1) {
    return normalized;
  }

  // If all lines are bullet points or numbered lists, keep single spacing
  const isAllList = rawLines.every(l => /^[-*•\d+.]\s+/.test(l));
  if (isAllList) {
    return rawLines.map(l => l.replace(/^[•]\s*/, '- ')).join('\n');
  }

  // Group lines into paragraphs, keeping consecutive bullet points together
  const paragraphs: string[] = [];
  let currentList: string[] = [];

  rawLines.forEach((line) => {
    const isBullet = /^[-*•\d+.]\s+/.test(line);
    if (isBullet) {
      currentList.push(line.replace(/^[•]\s*/, '- '));
    } else {
      if (currentList.length > 0) {
        paragraphs.push(currentList.join('\n'));
        currentList = [];
      }
      paragraphs.push(line);
    }
  });

  if (currentList.length > 0) {
    paragraphs.push(currentList.join('\n'));
  }

  return paragraphs.join('\n\n');
};

/**
 * Converts rich HTML (copied from websites, Google Docs, Word, news portals) into
 * clean markdown with proper \n\n paragraph spacing, bold/italics, links, and bullet lists.
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
        const text = Array.from(el.childNodes).map(serializeNode).join('').trim();
        return text ? `**${text}**` : '';
      }
      if (tag === 'em' || tag === 'i') {
        const text = Array.from(el.childNodes).map(serializeNode).join('').trim();
        return text ? `*${text}*` : '';
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
      const hasBlockChildren = el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, div');
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
      // Ensure all blocks are properly separated by \n\n
      return blocks.filter(b => b && b.trim()).join('\n\n');
    }
  } catch (err) {
    console.warn('HTML paste conversion fallback:', err);
  }
  return '';
};

/**
 * Unified paste formatter: prefers rich HTML extraction, falling back to plain text formatting.
 */
export const formatPastedContent = (html?: string, plain?: string): string => {
  if (html && html.trim()) {
    const formattedHtml = convertHtmlToEditorMarkdown(html);
    if (formattedHtml && formattedHtml.trim()) {
      return formattedHtml.trim();
    }
  }

  if (plain && plain.trim()) {
    return formatArticleText(plain);
  }

  return '';
};

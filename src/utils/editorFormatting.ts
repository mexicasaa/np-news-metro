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
 * Properly walks child nodes so root-level text nodes and inline elements are never discarded.
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

    const isBlockTag = (tag: string): boolean => {
      return ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'article', 'section', 'hr'].includes(tag);
    };

    const serializeInline = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Bold detection (b, strong, or style fontWeight)
      const fontWeight = el.style?.fontWeight;
      const isBoldSpan = tag === 'span' && (fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight, 10) >= 600);
      if (tag === 'strong' || tag === 'b' || isBoldSpan) {
        const text = Array.from(el.childNodes).map(serializeInline).join('');
        const trimmed = text.trim();
        if (!trimmed) return text;
        const leading = text.match(/^\s*/)?.[0] || '';
        const trailing = text.match(/\s*$/)?.[0] || '';
        return `${leading}**${trimmed}**${trailing}`;
      }

      // Italic detection (em, i, or style fontStyle)
      const fontStyle = el.style?.fontStyle;
      const isItalicSpan = tag === 'span' && fontStyle === 'italic';
      if (tag === 'em' || tag === 'i' || isItalicSpan) {
        const text = Array.from(el.childNodes).map(serializeInline).join('');
        const trimmed = text.trim();
        if (!trimmed) return text;
        const leading = text.match(/^\s*/)?.[0] || '';
        const trailing = text.match(/\s*$/)?.[0] || '';
        return `${leading}*${trimmed}*${trailing}`;
      }

      // Links
      if (tag === 'a') {
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        const href = el.getAttribute('href');
        if (text && href && !href.startsWith('javascript:')) {
          return `[${text}](${href})`;
        }
        return text;
      }

      // Line breaks within a block
      if (tag === 'br') {
        return '\n';
      }

      // Images
      if (tag === 'img') {
        const src = el.getAttribute('src');
        const alt = el.getAttribute('alt') || 'Photo';
        if (src && !src.startsWith('data:')) {
          return `\n\n![${alt}](${src})\n\n`;
        }
        return '';
      }

      return Array.from(el.childNodes).map(serializeInline).join('');
    };

    const blocks: string[] = [];
    let inlineBuffer = '';

    const flushInlineBuffer = () => {
      const trimmed = inlineBuffer.trim();
      if (trimmed) {
        blocks.push(trimmed);
      }
      inlineBuffer = '';
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        inlineBuffer += node.textContent || '';
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Heading 1 / 2
      if (tag === 'h1' || tag === 'h2') {
        flushInlineBuffer();
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) blocks.push(`## ${text}`);
        return;
      }

      // Heading 3-6
      if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        flushInlineBuffer();
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) blocks.push(`### ${text}`);
        return;
      }

      // Pullquote
      if (tag === 'blockquote') {
        flushInlineBuffer();
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) blocks.push(`> "${text.replace(/^["']|["']$/g, '')}"`);
        return;
      }

      // Unordered or Ordered lists
      if (tag === 'ul' || tag === 'ol') {
        flushInlineBuffer();
        const items: string[] = [];
        el.querySelectorAll('li').forEach(li => {
          const itemText = Array.from(li.childNodes).map(serializeInline).join('').trim();
          if (itemText) items.push(`- ${itemText}`);
        });
        if (items.length > 0) {
          blocks.push(items.join('\n'));
        }
        return;
      }

      // Paragraph
      if (tag === 'p') {
        flushInlineBuffer();
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) blocks.push(text);
        return;
      }

      // Div or Container
      if (tag === 'div' || tag === 'section' || tag === 'article') {
        const hasBlockChildren = Array.from(el.childNodes).some(child => 
          child.nodeType === Node.ELEMENT_NODE && isBlockTag((child as HTMLElement).tagName.toLowerCase())
        );

        if (hasBlockChildren) {
          flushInlineBuffer();
          Array.from(el.childNodes).forEach(processNode);
          flushInlineBuffer();
        } else {
          flushInlineBuffer();
          const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
          if (text) blocks.push(text);
        }
        return;
      }

      // Otherwise, inline element (span, b, strong, i, em, a, br, etc.)
      inlineBuffer += serializeInline(el);
    };

    // Iterate through all child nodes (including text nodes) in doc.body
    Array.from(doc.body.childNodes).forEach(processNode);
    flushInlineBuffer();

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

/**
 * Converts inline markdown syntax (bold, italic, links) into clean HTML tags
 * for presentation inside the rich editor.
 */
export const formatInlineToEditorHtml = (text: string): string => {
  if (!text) return '';
  let res = text;
  // Convert markdown bold **text** to <strong>text</strong>
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert markdown italic *text* to <em>$1</em> (excluding cases like bullets or wildcards)
  res = res.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  // Convert markdown links [text](url) to <a href="url">text</a>
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline font-medium">$1</a>');
  return res;
};

/**
 * Converts editor markdown into rich HTML suitable for the contentEditable editor.
 * Ensures existing articles with **bold**, *italic*, headings, lists, quotes, and newlines
 * are displayed with actual visual formatting, NOT raw markdown symbols.
 */
export const markdownToEditorHtml = (markdown: string): string => {
  if (!markdown || !markdown.trim()) return '<p><br></p>';

  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n+/);

  const htmlBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // If block is already HTML block tag, do not wrap in extra <p>
    if (/^<(p|div|h[1-6]|ul|ol|blockquote)[\s>]/i.test(trimmed)) {
      return formatInlineToEditorHtml(trimmed);
    }

    // Check heading 2: ## ...
    const h2Match = trimmed.match(/^##\s+([\s\S]*)$/);
    if (h2Match) {
      return `<h2>${formatInlineToEditorHtml(h2Match[1].trim())}</h2>`;
    }

    // Check heading 3: ### ...
    const h3Match = trimmed.match(/^###\s+([\s\S]*)$/);
    if (h3Match) {
      return `<h3>${formatInlineToEditorHtml(h3Match[1].trim())}</h3>`;
    }

    // Check pullquote: > "..."
    const quoteMatch = trimmed.match(/^>\s+"?([\s\S]*?)"?$/);
    if (quoteMatch) {
      return `<blockquote>"${formatInlineToEditorHtml(quoteMatch[1].trim())}"</blockquote>`;
    }

    // Check image: ![caption](url)
    const imgMatch = trimmed.match(/^!\[([\s\S]*?)\]\(([\s\S]*?)\)$/);
    if (imgMatch) {
      return `<p><img src="${imgMatch[2].trim()}" alt="${imgMatch[1].trim()}" class="my-3 rounded-xl max-w-full" /></p>`;
    }

    // Check bullet list: lines starting with - or *
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every(l => /^[-*]\s+/.test(l))) {
      const lis = lines.map(l => `<li>${formatInlineToEditorHtml(l.replace(/^[-*]\s+/, '').trim())}</li>`).join('');
      return `<ul>${lis}</ul>`;
    }

    // Regular paragraph: preserve single newlines with <br>
    const pLines = trimmed.split('\n');
    const innerHtml = pLines.map(line => formatInlineToEditorHtml(line)).join('<br>');
    return `<p>${innerHtml}</p>`;
  });

  return htmlBlocks.filter(Boolean).join('');
};

/**
 * Converts contentEditable HTML back into clean editorial markdown for storage.
 */
export const htmlToEditorMarkdown = (html: string): string => {
  if (!html || !html.trim()) return '';
  return convertHtmlToEditorMarkdown(html);
};

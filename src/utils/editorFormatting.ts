/**
 * Utilities for formatting article text and pasted content in the editor.
 * Preserves exact original spacing, indentation, and alignment without injecting
 * unwanted blank lines between lines of the same paragraph.
 */

/**
 * Cleans paragraph flow by merging broken single-line-breaks within paragraphs
 * into natural continuous sentences with proper spacing, while strictly preserving
 * paragraph boundaries (double newlines \n\n), bullet lists (- or *), headings (##),
 * pullquotes (>), and image tags.
 */
export const cleanParagraphFlow = (text: string): string => {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trim()) return '';

  // Split into distinct blocks by 2 or more newlines
  const blocks = normalized.split(/\n\s*\n+/);

  const cleaned = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // Handle HTML block tags (like <p class="text-center">...</p>)
    const htmlBlockMatch = trimmed.match(/^<([a-z0-9]+)(\s+[^>]*)?>([\s\S]*)<\/\1>$/i);
    if (htmlBlockMatch) {
      const tag = htmlBlockMatch[1].toLowerCase();
      const attrs = htmlBlockMatch[2] || '';
      const inner = htmlBlockMatch[3];
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tag)) {
        const innerMerged = inner.split('\n').map(l => l.trim()).filter(Boolean).join(' ');
        return `<${tag}${attrs}>${innerMerged}</${tag}>`;
      }
      return trimmed;
    }

    // Preserve markdown lists, headings, pullquotes, and images
    if (
      /^[-*]\s+/m.test(trimmed) ||
      /^#{1,6}\s+/m.test(trimmed) ||
      /^>/m.test(trimmed) ||
      /^!\[/m.test(trimmed)
    ) {
      return trimmed;
    }

    // Merge single line breaks inside the paragraph with a single space
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.join(' ');
  });

  return cleaned.filter(Boolean).join('\n\n');
};

/**
 * Formats article text for clean paragraph presentation:
 * - Normalizes Windows CRLF to standard Unix LF (\n).
 * - Cleans jagged single-line-breaks into continuous flowing paragraphs.
 * - Preserves double newlines (\n\n) between distinct paragraphs.
 * - Collapses excessive blank lines.
 */
export const formatArticleText = (text: string): string => {
  if (!text) return '';
  return cleanParagraphFlow(text);
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

      // Bold detection (b, strong, style fontWeight, or font-bold class)
      const rawFontWeight = (el.style?.fontWeight || '').toLowerCase().trim();
      const hasBoldClass = el.classList?.contains('font-bold') || el.classList?.contains('font-semibold');
      const isBoldTag = tag === 'b' || tag === 'strong';
      const isExplicitNormal = rawFontWeight === 'normal' || rawFontWeight === '400' || rawFontWeight === 'lighter';
      const isExplicitBold = rawFontWeight === 'bold' || rawFontWeight === '700' || rawFontWeight === '800' || rawFontWeight === '900' || parseInt(rawFontWeight, 10) >= 600 || hasBoldClass;
      
      const isBold = (isBoldTag || isExplicitBold) && !isExplicitNormal;
      if (isBold) {
        const text = Array.from(el.childNodes).map(serializeInline).join('');
        const trimmed = text.trim();
        if (!trimmed) return text;

        // Clean out any nested or redundant duplicate asterisks (e.g. if text already has **word**)
        let cleanText = trimmed;
        // Strip duplicate wrapping if already surrounded by asterisks
        while (cleanText.startsWith('**') && cleanText.endsWith('**') && cleanText.length >= 4) {
          cleanText = cleanText.slice(2, -2).trim();
        }
        // Collapse any runaway asterisks
        cleanText = cleanText.replace(/\*{3,}/g, '**');

        const leading = text.match(/^\s*/)?.[0] || '';
        const trailing = text.match(/\s*$/)?.[0] || '';
        return `${leading}**${cleanText}**${trailing}`;
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

      const getBlockAlignment = (element: HTMLElement): string => {
        const styleAlign = (element.style?.textAlign || element.getAttribute('align') || '').toLowerCase().trim();
        if (styleAlign === 'center' || styleAlign === 'right' || styleAlign === 'justify') return styleAlign;
        if (element.classList?.contains('text-center')) return 'center';
        if (element.classList?.contains('text-right')) return 'right';
        if (element.classList?.contains('text-justify')) return 'justify';
        return '';
      };

      // Heading 1 / 2
      if (tag === 'h1' || tag === 'h2') {
        flushInlineBuffer();
        const align = getBlockAlignment(el);
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) {
          if (align) {
            blocks.push(`<h2 class="text-${align}">${text}</h2>`);
          } else {
            blocks.push(`## ${text}`);
          }
        }
        return;
      }

      // Heading 3-6
      if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        flushInlineBuffer();
        const align = getBlockAlignment(el);
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) {
          if (align) {
            blocks.push(`<h3 class="text-${align}">${text}</h3>`);
          } else {
            blocks.push(`### ${text}`);
          }
        }
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
        const align = getBlockAlignment(el);
        const text = Array.from(el.childNodes).map(serializeInline).join('').trim();
        if (text) {
          if (align) {
            blocks.push(`<p class="text-${align}">${text}</p>`);
          } else {
            blocks.push(text);
          }
        }
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
 * Uses <b class="font-bold"> instead of <strong> because contentEditable's native
 * execCommand('bold') can reliably inspect, toggle, and unbold <b> elements,
 * whereas <strong> elements frequently get stuck or fail to unbold when updating articles.
 */
export const formatInlineToEditorHtml = (text: string): string => {
  if (!text) return '';
  let res = text;

  // Clean out any runaway consecutive asterisks
  res = res.replace(/\*{4,}/g, '**');

  // Normalize existing <strong> tags to standard <b> for seamless contentEditable toggle
  res = res.replace(/<strong(?:\s+[^>]*)?>([\s\S]*?)<\/strong>/gi, '<b>$1</b>');
  res = res.replace(/<b(?:\s+class=["'][^"']*["'])?>([\s\S]*?)<\/b>/gi, '<b>$1</b>');

  // Convert markdown bold **text** to <b>text</b>
  // Non-greedy match that supports Hindi/Unicode, punctuation, and inner content
  res = res.replace(/\*\*([^\*\n]+?)\*\*/g, '<b>$1</b>');

  // Convert markdown italic *text* to <em>$1</em> (excluding cases like bullets or wildcards)
  res = res.replace(/(^|[^*])\*([^*\n]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');

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
      let formatted = formatInlineToEditorHtml(trimmed);
      const alignMatch = formatted.match(/class=["'][^"']*text-(center|right|justify|left)[^"']*["']/i);
      if (alignMatch && !formatted.includes('style=')) {
        const align = alignMatch[1];
        formatted = formatted.replace(/<([a-z0-9]+)\s+([^>]*class=["'][^"']*text-[^"']*["'][^>]*)>/i, `<$1 $2 style="text-align: ${align};">`);
      }
      return formatted;
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

/**
 * Reconstructs clean markdown from structured Gutenberg blocks or fallback content string.
 * Accurately extracts headings, bullet lists, pullquotes, inline images, and paragraphs
 * with all bold/italic formatting preserved without corruption.
 */
export const reconstructMarkdownFromBlocks = (
  blocks?: Array<{ type?: string; content?: string; level?: number; items?: string[]; imageCaption?: string; imageUrl?: string }>,
  fallbackContent?: string
): string => {
  if (blocks && blocks.length > 0) {
    const pieces = blocks.map(b => {
      if (b.type === 'image') return `![${b.imageCaption || 'Image'}](${b.imageUrl || ''})`;
      if (b.type === 'heading') return b.level === 3 ? `### ${b.content || ''}` : `## ${b.content || ''}`;
      if (b.type === 'pullquote') return `> "${(b.content || '').replace(/^["']|["']$/g, '')}"`;
      if (b.type === 'list') {
        if (b.items && b.items.length > 0) {
          return b.items.map(it => `- ${it}`).join('\n');
        }
        return b.content || '';
      }
      return b.content || '';
    }).filter(p => typeof p === 'string' && p.trim().length > 0);

    if (pieces.length > 0) {
      return pieces.join('\n\n');
    }
  }
  return fallbackContent || '';
};

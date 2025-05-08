#!/usr/bin/env node
// ==== FILE: linter.js ====
// description: CLI tool for Unicode sanitation

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Command } = require('commander');
const Parser = require('tree-sitter');
const JS = require('tree-sitter-javascript');
const matter = require('gray-matter');

// Load mapping config
const cfg = yaml.load(fs.readFileSync(path.resolve(__dirname, 'mapping.yaml'), 'utf8'));

// CLI flags
const program = new Command();
program
  .option('--fix', 'apply changes in-place')
  .option('--allow-fancy', 'allow fancy codepoints in markdown')
  .argument('<files...>')
  .parse(process.argv);
const opts = program.opts();
const files = program.args;

// Base sanitizer: NFC, strip BOM, directionals, zero-widths, control
function baseSanitize(text) {
  return text.normalize('NFC')
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, '')
    // remove control codes except newline (\u000A)
    .replace(/[\u0000-\u0009\u000B-\u001F]/g, '');
}

// transform per codepoint using mappings, removes, allow lists
function transformText(str, context) {
  let out = '';
  for (const ch of Array.from(str)) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');
    // remove ranges
    if (cfg.remove.some(r => {
      const [s,e] = r.split('-').map(x=>parseInt(x,16));
      const v = parseInt(cp,16);
      return v>=s && v<=e;
    })) continue;
    // mappings
    if (cfg.mappings[cp]) {
      out += String.fromCodePoint(parseInt(cfg.mappings[cp],16));
    } else {
      const allowed = (cfg.allow[context]||{}).codepoints || [];
      if (opts.allowFancy && allowed.includes(cp)) {
        out += ch;
      } else {
        out += ch;
      }
    }
  }
  return out;
}

// AST-based code transform (JS/TS)
function transformCode(content) {
  const parser = new Parser();
  parser.setLanguage(JS);
  const tree = parser.parse(content);
  const edits = [];
  function visit(node) {
    if (node.type === 'string' || node.type === 'comment') {
      const src = content.slice(node.startIndex, node.endIndex);
      const rep = transformText(src, 'uiDocs');
      if (rep !== src) edits.push({ start: node.startIndex, end: node.endIndex, text: rep });
    }
    for (const c of node.children) visit(c);
  }
  visit(tree.rootNode);
  // apply edits in reverse order
  let out = content;
  edits.sort((a,b)=>b.start-a.start).forEach(e=>{
    out = out.slice(0,e.start)+e.text+out.slice(e.end);
  });
  return out;
}

// Markdown transform skipping code fences & inline code
function transformMarkdown(raw, allowFancyLocal) {
  const fm = matter(raw);
  let body = fm.content;
  const lines = body.split(/\r?\n/);
  let inFence = false;
  const out = lines.map(line => {
    if (/^```/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    // inline code skip
    return line.split(/(`[^`]+`)/g).map((seg,i)=> i%2 ? seg : transformText(seg, 'markdownParagraph')).join('');
  }).join('\n');
  return matter.stringify(out, fm.data);
}

// Process files
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  let txt = fs.readFileSync(file, 'utf8');
  txt = baseSanitize(txt);
  let result = txt;

  if (['.js','.ts','.py','.go'].includes(ext)) {
    result = transformCode(txt);

  } else if (ext === '.md' || ext === '.html') {
    // detect fancy from frontmatter or flag, avoid parsing full frontmatter when fancy
    const frontEnd = txt.startsWith('---\n') ? txt.indexOf('\n---', 3) : -1;
    const hasFancyMeta = frontEnd > 0 && /typography:\s*fancy/.test(txt.slice(0, frontEnd));
    const fancyLocal = hasFancyMeta || opts.allowFancy || process.argv.includes('--allow-fancy');
    result = fancyLocal ? txt : transformMarkdown(txt, fancyLocal);

  } else if (ext === '.txt') {
    // plain text: apply paragraph context mapping directly and trim trailing newline
    result = transformText(txt, 'markdownParagraph').replace(/[\r\n]+$/, '');
  }

  if (opts.fix) fs.writeFileSync(file, result, 'utf8');
  else console.log(`${file}: sanitized`);
}

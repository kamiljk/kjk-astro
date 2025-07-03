#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

const postsDir = path.join(__dirname, '../src/content/posts');
const today = '2025-05-04';

try {
  fs.readdirSync(postsDir).forEach(file => {
    if (!file.endsWith('.md')) return;
    const filePath = path.join(postsDir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error(`Failed to read ${filePath}:`, err);
      return;
    }
    let attributes, body;
    try {
      ({ attributes, body } = fm(content));
    } catch (err) {
      console.error(`Failed to parse frontmatter in ${filePath}:`, err);
      return;
    }
    let updated = false;

    // Rename `date` to `dateCreated`
    if (attributes.date) {
      attributes.dateCreated = attributes.date;
      delete attributes.date;
      updated = true;
    }

    // Ensure dateCreated exists
    if (!attributes.dateCreated) {
      attributes.dateCreated = today;
      updated = true;
    }

    // Remove quotes from dateCreated and dateUpdated
    ['dateCreated', 'dateUpdated'].forEach(field => {
      if (attributes[field] && typeof attributes[field] === 'string') {
        // parse to Date then format back
        const d = new Date(attributes[field]);
        if (!isNaN(d)) {
          attributes[field] = d.toISOString().split('T')[0];
          updated = true;
        }
      }
    });

    // Reconstruct frontmatter
    if (updated) {
      const fmLines = ['---'];
      Object.entries(attributes).forEach(([key, value]) => {
        fmLines.push(`${key}: ${value}`);
      });
      fmLines.push('---', '', body.trim(), '');
      try {
        fs.writeFileSync(filePath, fmLines.join('\n'));
        console.log(`Updated frontmatter for ${file}`);
      } catch (err) {
        console.error(`Failed to write ${filePath}:`, err);
      }
    }
  });
} catch (err) {
  console.error('Failed to process posts directory:', err);
}
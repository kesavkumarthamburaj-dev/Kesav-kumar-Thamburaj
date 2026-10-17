import fs from 'fs';

const text = fs.readFileSync('C:/Users/DELL/.gemini/antigravity-ide/brain/dd8225c0-cffa-4e2a-8b11-51e914fd41c9/.system_generated/steps/612/content.md', 'utf8');

const matches = text.match(/href="[^"]+"/gi) || [];
console.log('Links found:', matches);

const buttons = text.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
console.log('Buttons found:', buttons);

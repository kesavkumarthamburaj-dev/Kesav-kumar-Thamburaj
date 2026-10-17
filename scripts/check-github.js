import fs from 'fs';

const svg = fs.readFileSync('temp_gh_extracted/GitHub Logos/SVG/GitHub_Invertocat_Black.svg', 'utf8');
console.log('GitHub Invertocat SVG length:', svg.length);
console.log(svg.slice(0, 500));

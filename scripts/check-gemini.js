import { fetchText } from './fetch-logos-helper.js';

async function checkGemini() {
  try {
    const si = await fetchText('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/googlegemini.svg');
    console.log('Simple Icons googlegemini.svg length:', si.length);
    console.log(si.slice(0, 300));
  } catch (e) {
    console.log('Failed simple icons:', e.message);
  }

  try {
    const wiki = await fetchText('https://upload.wikimedia.org/wikipedia/commons/8/8f/Google-gemini-icon.svg');
    console.log('Wiki Google-gemini-icon.svg length:', wiki.length);
    console.log(wiki.slice(0, 400));
  } catch (e) {
    console.log('Failed wiki gemini:', e.message);
  }
}

checkGemini();

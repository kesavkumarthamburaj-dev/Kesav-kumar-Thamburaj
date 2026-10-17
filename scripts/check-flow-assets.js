import { fetchBuffer, fetchText } from './fetch-logos-helper.js';

async function checkFlowAssets() {
  const bBuf = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/favicon/flow_favicon_b.png');
  const wBuf = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/favicon/flow_favicon_w.png');
  console.log('flow_favicon_b.png size:', bBuf.length);
  console.log('flow_favicon_b dimensions:', bBuf.readUInt32BE(16), 'x', bBuf.readUInt32BE(20));
  console.log('flow_favicon_w dimensions:', wBuf.readUInt32BE(16), 'x', wBuf.readUInt32BE(20));

  // Inspect og-flow image
  const ogBuf = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/social/og-flow-1200x627.png');
  console.log('og-flow dimensions:', ogBuf.readUInt32BE(16), 'x', ogBuf.readUInt32BE(20));

  // Now search the main JS bundle of Google Flow for SVG paths or logo references
  const jsUrl = 'https://www.gstatic.com/_/mss/boq-labs-ai-sandbox/_/js/k=boq-labs-ai-sandbox.AiSandboxAngularFrontend.en_US.OfiZ0mUhm-Y.2018.O/ck=boq-labs-ai-sandbox.AiSandboxAngularFrontend.BQN4SQvXDEI.L.X.O/d=1/exm=_b/excm=_b/ed=1/br=1/wt=2/ujg=1/rs=APwUF7ydxcYRJlXkz19J1kRRZv0Ut6GUjA/ee=Pjplud:PoEs9b;QGR0gd:Mlhmy;ScI3Yc:e7Hzgb;YIZmRd:A1yn5d;cEt90b:ws9Tlc;dowIGb:ebZ3mb/dti=1/m=GK5kFd';
  try {
    const js = await fetchText(jsUrl);
    console.log('Flow JS bundle size:', js.length);
    // Find any SVG paths in the JS bundle
    const svgMatches = js.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
    console.log('SVG count in JS bundle:', svgMatches.length);
    svgMatches.forEach((s, i) => console.log(`Bundle SVG ${i}:`, s.slice(0, 150)));

    // Look for flow logo / icon in JS
    const flowLogoMatches = js.match(/(?:flow[_-]logo|flow[_-]icon)[^"'\s]*/gi) || [];
    console.log('flow-logo / flow-icon mentions:', flowLogoMatches);
  } catch (e) {
    console.log('JS fetch error:', e.message);
  }
}

checkFlowAssets();

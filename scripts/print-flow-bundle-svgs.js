import { fetchText } from './fetch-logos-helper.js';

async function printBundleSvgs() {
  const jsUrl = 'https://www.gstatic.com/_/mss/boq-labs-ai-sandbox/_/js/k=boq-labs-ai-sandbox.AiSandboxAngularFrontend.en_US.OfiZ0mUhm-Y.2018.O/ck=boq-labs-ai-sandbox.AiSandboxAngularFrontend.BQN4SQvXDEI.L.X.O/d=1/exm=_b/excm=_b/ed=1/br=1/wt=2/ujg=1/rs=APwUF7ydxcYRJlXkz19J1kRRZv0Ut6GUjA/ee=Pjplud:PoEs9b;QGR0gd:Mlhmy;ScI3Yc:e7Hzgb;YIZmRd:A1yn5d;cEt90b:ws9Tlc;dowIGb:ebZ3mb/dti=1/m=GK5kFd';
  const js = await fetchText(jsUrl);
  const svgs = js.match(/<svg[^>]*>[\s\S]*?<\/svg>/gi) || [];
  svgs.forEach((s, i) => {
    console.log(`\n--- Bundle SVG ${i} ---`);
    console.log(s);
  });
}

printBundleSvgs();

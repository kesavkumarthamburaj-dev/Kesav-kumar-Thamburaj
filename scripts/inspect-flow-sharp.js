import sharp from 'sharp';
import { fetchBuffer } from './fetch-logos-helper.js';

async function inspectPng() {
  const bufB = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/favicon/flow_favicon_b.png');
  const imgB = sharp(bufB);
  const metaB = await imgB.metadata();
  console.log('flow_favicon_b metadata:', metaB);

  // Let's trim transparency and see the content bounding box
  const trimmedB = await sharp(bufB).trim().toBuffer({ resolveWithObject: true });
  console.log('flow_favicon_b trimmed dimensions:', trimmedB.info.width, 'x', trimmedB.info.height);

  const bufW = await fetchBuffer('https://www.gstatic.com/aitestkitchen/website/flow/favicon/flow_favicon_w.png');
  const imgW = sharp(bufW);
  const metaW = await imgW.metadata();
  console.log('flow_favicon_w metadata:', metaW);
  const trimmedW = await sharp(bufW).trim().toBuffer({ resolveWithObject: true });
  console.log('flow_favicon_w trimmed dimensions:', trimmedW.info.width, 'x', trimmedW.info.height);

  // Let's render an ASCII art representation of the trimmed image to see what it is!
  const asciiBuf = await sharp(bufB).resize(60, 30, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).raw().toBuffer({ resolveWithObject: true });
  const statsB = await sharp(bufB).stats();
  console.log('Channels min/max/mean:');
  statsB.channels.forEach((c, i) => console.log('Ch ' + i + ': min=' + c.min + ', max=' + c.max + ', mean=' + c.mean.toFixed(1)));
}

inspectPng().catch(console.error);

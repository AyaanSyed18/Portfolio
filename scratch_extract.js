const fs = require('fs');
const html = fs.readFileSync('scratch_spline.html', 'utf8');
const match = html.match(/app\.start\(\[(.*?)\]\)/);
if (match) {
  const arr = match[1].split(',').map(Number);
  const buffer = Buffer.from(arr);
  fs.writeFileSync('public/church_scene.splinecode', buffer);
  console.log("Successfully extracted to public/church_scene.splinecode");
} else {
  console.log("Could not find app.start array in HTML");
}

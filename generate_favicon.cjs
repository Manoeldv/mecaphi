const fs = require('fs');
const img = fs.readFileSync('public/logo-.png');
const base64 = img.toString('base64');

// 3x zoom!
// 256 * 3 = 768. (256 - 768) / 2 = -256
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <clipPath id="circleView">
      <circle cx="128" cy="128" r="128" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${base64}" x="-256" y="-256" width="768" height="768" preserveAspectRatio="xMidYMid meet" clip-path="url(#circleView)" />
</svg>`;
fs.writeFileSync('public/favicon.svg', svg);
console.log('Favicon created successfully with 3x bigger logo!');

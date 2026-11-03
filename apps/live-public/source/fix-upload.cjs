
const fs=require('node:fs');
const original='public/upload.html';
if(!fs.existsSync(original))throw new Error('Original Wingking upload page not found');
let html=fs.readFileSync(original,'utf8');
const a=html.lastIndexOf('<script>'),b=html.lastIndexOf('</script>');
if(a<0||b<=a||html.indexOf('wingking-guest-submissions',a,b)<0)throw new Error('Unexpected original upload script');
html=html.slice(0,a)+'<script type="module" src="/src/guest-upload.js"></script>'+html.slice(b+9);
html=html.replace('Video MP4/WebM (maks 35MB)','Video MP4 / WebM / MOV (maks 35 MB)');
html=html.replace('accept="video/mp4,video/webm"','accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"');
fs.writeFileSync('upload.html',html);
fs.unlinkSync(original);
console.log('Wingking upload: bundled multi-page form, MOV supported, resumable uploads enabled');

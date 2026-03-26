const fs=require('fs');
const data=fs.readFileSync('node_modules\\@babel\\plugin-transform-runtime\\node_modules\\babel-plugin-polyfill-corejs3\\lib\\index.js','utf8');
console.log(data.split('\n').slice(0,20).join('\n'));

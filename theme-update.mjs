import fs from 'fs';

const replaceTheme = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-orange/g, 'bg-cyan');
  content = content.replace(/text-orange/g, 'text-cyan');
  content = content.replace(/border-orange/g, 'border-cyan');
  content = content.replace(/ring-orange/g, 'ring-cyan');
  content = content.replace(/from-orange-500 to-rose-500/g, 'from-cyan-500 to-indigo-500');
  content = content.replace(/from-orange-600\/40 via-rose-600\/30 to-purple-800\/30/g, 'from-cyan-600/40 via-indigo-600/30 to-violet-800/30');
  content = content.replace(/from-rose-600\/30 via-orange-500\/30 to-amber-500\/20/g, 'from-indigo-600/30 via-cyan-500/30 to-teal-500/20');
  content = content.replace(/rgba\(249,115,22/g, 'rgba(6,182,212'); // orange-500 hex to cyan-500 rgb
  content = content.replace(/selection:bg-orange/g, 'selection:bg-cyan');
  content = content.replace(/bg-bg-warm/g, 'bg-bg-base'); // replace old warm bg class
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
};

const screensDir = './src/screens';
const componentsDir = './src/components';

const getAllFiles = (dir) => {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getAllFiles(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
};

const filesToUpdate = ['./src/App.jsx', ...getAllFiles(screensDir), ...getAllFiles(componentsDir)];
filesToUpdate.forEach(replaceTheme);

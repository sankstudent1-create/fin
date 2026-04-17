import fs from 'fs';

const revertTheme = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-cyan/g, 'bg-orange');
  content = content.replace(/text-cyan/g, 'text-orange');
  content = content.replace(/border-cyan/g, 'border-orange');
  content = content.replace(/ring-cyan/g, 'ring-orange');
  content = content.replace(/from-cyan-500 to-indigo-500/g, 'from-orange-500 to-rose-500');
  content = content.replace(/from-cyan-600\/40 via-indigo-600\/30 to-violet-800\/30/g, 'from-orange-600/40 via-rose-600/30 to-purple-800/30');
  content = content.replace(/from-indigo-600\/30 via-cyan-500\/30 to-teal-500\/20/g, 'from-rose-600/30 via-orange-500/30 to-amber-500/20');
  content = content.replace(/rgba\(6,182,212/g, 'rgba(249,115,22'); // cyan-500 to orange-500 rgb
  content = content.replace(/selection:bg-cyan/g, 'selection:bg-orange');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Reverted ${filePath}`);
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
filesToUpdate.forEach(revertTheme);

const fs = require('fs');
const path = require('path');

const vendorDir = path.join(__dirname, '..', 'vendor');
const nodeModulesDir = path.join(__dirname, '..', 'node_modules', '@bryntum');

// Create @bryntum directory in node_modules if it doesn't exist
if (!fs.existsSync(nodeModulesDir)) {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
}

// Copy vendor/gantt to node_modules/@bryntum/gantt
const ganttSrc = path.join(vendorDir, 'gantt');
const ganttDest = path.join(nodeModulesDir, 'gantt');

// Copy vendor/gantt-react to node_modules/@bryntum/gantt-react
const reactSrc = path.join(vendorDir, 'gantt-react');
const reactDest = path.join(nodeModulesDir, 'gantt-react');

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`Source not found: ${src}`);
        return;
    }

    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }

    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied: ${src} -> ${dest}`);
}

console.log('Setting up Bryntum Gantt modules...');
copyRecursive(ganttSrc, ganttDest);
copyRecursive(reactSrc, reactDest);
console.log('Done!');

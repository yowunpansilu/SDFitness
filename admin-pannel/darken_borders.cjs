const fs = require('fs');
const path = require('path');

function processDir(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    processDir(fullPath);
                } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let orig = content;

                    // Make borders slightly darker for better contrast
                    content = content.replace(/border-slate-300/g, 'border-[TEMP-400]'); // temp placeholder to avoid double replace
                    content = content.replace(/border-slate-200/g, 'border-slate-300');
                    content = content.replace(/border-\[TEMP-400\]/g, 'border-slate-400');
                    
                    // Also darken the ring properties so focus doesn't disappear
                    content = content.replace(/ring-slate-200/g, 'ring-[TEMP-300]');
                    content = content.replace(/ring-slate-100/g, 'ring-slate-200');
                    content = content.replace(/ring-\[TEMP-300\]/g, 'ring-slate-300');

                    if (content !== orig) {
                        fs.writeFileSync(fullPath, content);
                        console.log('Updated borders:', fullPath);
                    }
                }
            } catch (err) {
                console.error(`Error processing file ${fullPath}:`, err.message);
            }
        }
    } catch (err) {
        console.error(`Error reading dir ${dir}:`, err.message);
    }
}

console.log('Starting border darkening...');
processDir('d:/Projects/Gym/SDFitness/admin-pannel/src');
console.log('Border darkening completed.');

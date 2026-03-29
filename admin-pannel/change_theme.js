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

                    // Backgrounds
                    content = content.replace(/bg-navy-950/g, 'bg-slate-50');
                    content = content.replace(/bg-navy-900/g, 'bg-white');
                    content = content.replace(/bg-navy-800/g, 'bg-slate-100');
                    content = content.replace(/bg-navy-700/g, 'bg-slate-200');
                    content = content.replace(/bg-navy-600/g, 'bg-slate-300');
                    content = content.replace(/bg-navy-500/g, 'bg-slate-400');
                    content = content.replace(/bg-slate-900/g, 'bg-white');
                    content = content.replace(/bg-slate-950/g, 'bg-slate-50');
                    
                    // Reversing gradients that were dark
                    content = content.replace(/from-slate-900 to-navy-900/g, 'from-white to-slate-50');
                    content = content.replace(/from-indigo-900\/40 to-navy-900/g, 'from-indigo-50 to-white');
                    content = content.replace(/from-amber-900\/30 to-navy-900/g, 'from-amber-50 to-white');

                    // Text colors (Darken for light background visibility)
                    content = content.replace(/text-navy-300/g, 'text-slate-600');
                    content = content.replace(/text-navy-400/g, 'text-slate-600');
                    content = content.replace(/text-navy-500/g, 'text-slate-700');
                    content = content.replace(/text-navy-600/g, 'text-slate-800');
                    content = content.replace(/text-navy-700/g, 'text-slate-900');
                    content = content.replace(/text-navy-800/g, 'text-slate-900');
                    content = content.replace(/text-slate-400/g, 'text-slate-700');
                    content = content.replace(/text-slate-300/g, 'text-slate-600');

                    // Borders
                    content = content.replace(/border-navy-800/g, 'border-slate-200');
                    content = content.replace(/border-navy-700/g, 'border-slate-200');
                    content = content.replace(/border-navy-600/g, 'border-slate-300');
                    content = content.replace(/border-navy-900/g, 'border-slate-200');
                    content = content.replace(/border-navy-950/g, 'border-slate-300');
                    content = content.replace(/border-slate-800/g, 'border-slate-200');
                    
                    // Rings
                    content = content.replace(/ring-navy-900/g, 'ring-slate-200');
                    content = content.replace(/ring-navy-950/g, 'ring-slate-100');

                    // Hardcoded "white" borders changing to light gray
                    content = content.replace(/border-white\/10/g, 'border-slate-200');
                    content = content.replace(/border-white\/20/g, 'border-slate-200');

                    // General text-white replacements 
                    content = content.replace(/text-white/g, 'text-slate-900');
                    
                    // Fix badges or buttons that actually need to keep white text because they have a colored background
                    const fixColoredBackgrounds = (oldContent) => {
                         let updated = oldContent;
                         // Case 1: bg-color happens before text-slate-900
                         updated = updated.replace(/(bg-(?:indigo|emerald|blue|rose|purple|red|green|amber|orange)-[56]00[^>]*?)text-slate-900/g, '$1text-white');
                         // Case 2: text-slate-900 happens before bg-color
                         updated = updated.replace(/text-slate-900([^>]*?bg-(?:indigo|emerald|blue|rose|purple|red|green|amber|orange)-[56]00)/g, 'text-white$1');
                         return updated;
                    };
                    content = fixColoredBackgrounds(content);
                    // Run twice for edge cases
                    content = fixColoredBackgrounds(content);

                    if (content !== orig) {
                        fs.writeFileSync(fullPath, content);
                        console.log('Updated:', fullPath);
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

console.log('Starting conversion...');
processDir('d:/Projects/Gym/SDFitness/admin-pannel/src');
console.log('Theme conversion completed.');

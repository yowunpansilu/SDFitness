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

                    // Deep navy backgrounds to white
                    content = content.replace(/bg-navy-950/g, 'bg-slate-50');
                    content = content.replace(/bg-navy-900/g, 'bg-white');
                    content = content.replace(/bg-slate-900/g, 'bg-white');
                    content = content.replace(/bg-slate-950/g, 'bg-slate-50');

                    // Darkish navy backgrounds to lighter slate
                    content = content.replace(/bg-navy-800/g, 'bg-slate-100');
                    content = content.replace(/bg-navy-700/g, 'bg-slate-200');
                    content = content.replace(/bg-navy-600/g, 'bg-slate-300');
                    content = content.replace(/bg-navy-500/g, 'bg-slate-400');
                    
                    // Specific complex gradients
                    content = content.replace(/from-slate-900 to-navy-900/g, 'from-white to-slate-50');
                    content = content.replace(/from-indigo-900\/40 to-navy-900/g, 'from-indigo-50 to-white');
                    content = content.replace(/from-amber-900\/30 to-navy-900/g, 'from-amber-50 to-white');
                    content = content.replace(/from-indigo-950 to-navy-950/g, 'from-slate-50 to-white');

                    // Text colors from light text (for dark BG) to dark text (for light BG)
                    content = content.replace(/text-navy-300/g, 'text-slate-600');
                    content = content.replace(/text-navy-400/g, 'text-slate-600');
                    content = content.replace(/text-navy-500/g, 'text-slate-700');
                    content = content.replace(/text-navy-600/g, 'text-slate-800');
                    content = content.replace(/text-navy-700/g, 'text-slate-900');
                    content = content.replace(/text-navy-800/g, 'text-slate-900');
                    content = content.replace(/text-slate-400/g, 'text-slate-700');
                    content = content.replace(/text-slate-300/g, 'text-slate-600');

                    // Borders from dark lines to light lines
                    content = content.replace(/border-navy-800/g, 'border-slate-200');
                    content = content.replace(/border-navy-700/g, 'border-slate-200');
                    content = content.replace(/border-navy-600/g, 'border-slate-300');
                    content = content.replace(/border-navy-900/g, 'border-slate-200');
                    content = content.replace(/border-navy-950/g, 'border-slate-300');
                    content = content.replace(/border-slate-800/g, 'border-slate-200');
                    content = content.replace(/border-white\/10/g, 'border-slate-200');
                    content = content.replace(/border-white\/20/g, 'border-slate-300');
                    
                    // Rings from dark to light
                    content = content.replace(/ring-navy-900/g, 'ring-slate-200');
                    content = content.replace(/ring-navy-950/g, 'ring-slate-100');

                    // Universal replacement: make the majority of main white text dark slate.
                    content = content.replace(/text-white/g, 'text-slate-900');
                    
                    // Now undo text-slate-900 specifically for badge labels, primary buttons, colored avatars, etc.
                    const fixWhiteText = (s) => {
                         let r = s;
                         // Regex pattern to revert text-slate-900 back to text-white if there is a primary color background applied on the same element before it.
                         r = r.replace(/(bg-(?:indigo|emerald|rose|amber|blue|green|red|purple|orange|cyan)-[56]00[^>]*?)text-slate-900/g, '$1text-white');
                         // Regex pattern to revert text-slate-900 if there's a primary color background applied after it in the same className string.
                         r = r.replace(/text-slate-900([^>]*?bg-(?:indigo|emerald|rose|amber|blue|green|red|purple|orange|cyan)-[56]00)/g, 'text-white$1');
                         return r;
                    };
                    
                    content = fixWhiteText(content);
                    content = fixWhiteText(content); // loop twice for safety on multiple matches

                    // Revert specific cases where text should actually be white instead of slate-900
                    content = content.replace(/text-indigo-400/g, 'text-indigo-600');
                    content = content.replace(/text-indigo-500/g, 'text-indigo-600');
                    content = content.replace(/text-emerald-400/g, 'text-emerald-600');
                    content = content.replace(/text-rose-400/g, 'text-rose-600');
                    content = content.replace(/text-amber-400/g, 'text-amber-600');

                    // Lighter placeholder colors
                    content = content.replace(/placeholder:text-navy-700/g, 'placeholder:text-slate-400');
                    content = content.replace(/placeholder:text-slate-400/g, 'placeholder:text-slate-400');
                    
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

console.log('Starting light theme conversion...');
processDir('d:/Projects/Gym/SDFitness/admin-pannel/src');
console.log('Theme conversion completed.');

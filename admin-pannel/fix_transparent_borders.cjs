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

                    // Remove border-transparent from elements that now need visible borders in light theme
                    // Specifically looking for Card components or general containers with both border-transparent and a background
                    content = content.replace(/border-transparent/g, 'border-slate-300');
                    
                    // Also replace border-none on cards/badges if they need to be visible. Let's be careful with border-none, maybe just border-transparent is the culprit.
                    // Card components specifically:
                    content = content.replace(/<Card className="([^"]*?)border-none([^"]*?)"/g, '<Card className="$1border-slate-300$2"');

                    // If a component has both 'border-slate-300' and 'border-slate-200', clean that up
                    content = content.replace(/border-slate-200\s+([^"']*?)border-slate-300/g, 'border-slate-300 $1');
                    content = content.replace(/border-slate-300\s+([^"']*?)border-slate-200/g, 'border-slate-300 $1');
                    
                    // Same for transparent duplicates
                    content = content.replace(/border-slate-[234]00\s+([^"']*?)border-transparent/g, 'border-slate-300 $1');

                    // If they have border-2 but also just fixed to border-slate-300, it will use 2px slate-300 which is good.

                    if (content !== orig) {
                        fs.writeFileSync(fullPath, content);
                        console.log('Fixed transparent borders:', fullPath);
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

console.log('Starting border fix...');
processDir('d:/Projects/Gym/SDFitness/admin-pannel/src');
console.log('Border fix completed.');

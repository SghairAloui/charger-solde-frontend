const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.scss')) {
            results.push(file);
        }
    });
    return results;
}

const scssFiles = walk(path.join(__dirname, './src'));

let replacedCount = 0;

scssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace rgba($variable, alpha) with rgba(var(--variable-rgb), alpha)
    // It captures the variable name without the $
    const regex = /rgba\(\s*\$([a-zA-Z0-9-]+)\s*,\s*([0-9.]+)\s*\)/g;
    
    if (regex.test(content)) {
        const newContent = content.replace(regex, (match, varName, alpha) => {
            return `rgba(var(--${varName}-rgb), ${alpha})`;
        });
        fs.writeFileSync(file, newContent, 'utf8');
        replacedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Replaced in ${replacedCount} files.`);

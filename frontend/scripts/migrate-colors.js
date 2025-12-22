#!/usr/bin/env node

/**
 * Color Migration Script for ProjectHUB
 * Automatically replaces old color classes with new green-based palette
 * 
 * Usage: node scripts/migrate-colors.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mapping rules
const replacements = [
    // Gradient removals - Replace with solid colors
    {
        pattern: /bg-gradient-to-r from-emerald-500 to-teal-500/g,
        replacement: 'bg-[#2d6a4f] hover:bg-[#74c69d]',
        description: 'Primary gradient button'
    },
    {
        pattern: /bg-gradient-to-r from-emerald-600 to-teal-600/g,
        replacement: 'bg-[#2d6a4f]',
        description: 'Primary gradient darker'
    },
    {
        pattern: /bg-gradient-to-br from-emerald-500 to-teal-500/g,
        replacement: 'bg-[#2d6a4f]',
        description: 'Primary gradient BR'
    },
    {
        pattern: /bg-gradient-to-br from-emerald-400 to-teal-500/g,
        replacement: 'bg-[#74c69d]',
        description: 'Secondary gradient'
    },
    {
        pattern: /bg-gradient-to-br from-emerald-50 to-teal-50/g,
        replacement: 'bg-[#f8faf9]',
        description: 'Light background gradient'
    },
    {
        pattern: /bg-gradient-to-r from-blue-600 to-purple-600/g,
        replacement: 'bg-[#2ec4b6]',
        description: 'Blue gradient to teal'
    },
    {
        pattern: /from-gray-50 via-emerald-50\/30 to-teal-50\/30/g,
        replacement: 'bg-[#f8faf9]',
        description: 'Complex background gradient'
    },

    // Emerald color replacements
    {
        pattern: /bg-emerald-500/g,
        replacement: 'bg-[#74c69d]',
        description: 'Emerald 500'
    },
    {
        pattern: /bg-emerald-600/g,
        replacement: 'bg-[#2d6a4f]',
        description: 'Emerald 600'
    },
    {
        pattern: /bg-emerald-700/g,
        replacement: 'bg-[#2d6a4f]',
        description: 'Emerald 700'
    },
    {
        pattern: /text-emerald-600/g,
        replacement: 'text-[#2d6a4f]',
        description: 'Emerald text 600'
    },
    {
        pattern: /text-emerald-500/g,
        replacement: 'text-[#74c69d]',
        description: 'Emerald text 500'
    },
    {
        pattern: /text-emerald-400/g,
        replacement: 'text-[#74c69d]',
        description: 'Emerald text 400'
    },
    {
        pattern: /border-emerald-500/g,
        replacement: 'border-[#2d6a4f]',
        description: 'Emerald border'
    },
    {
        pattern: /border-emerald-200/g,
        replacement: 'border-[#d8e2dc]',
        description: 'Emerald light border'
    },
    {
        pattern: /bg-emerald-50/g,
        replacement: 'bg-[#f8faf9]',
        description: 'Emerald background light'
    },
    {
        pattern: /bg-emerald-100/g,
        replacement: 'bg-[#f8faf9]',
        description: 'Emerald background 100'
    },

    // Blue/Teal replacements
    {
        pattern: /bg-blue-500/g,
        replacement: 'bg-[#2ec4b6]',
        description: 'Blue to teal'
    },
    {
        pattern: /bg-blue-600/g,
        replacement: 'bg-[#2ec4b6]',
        description: 'Blue 600 to teal'
    },
    {
        pattern: /text-blue-600/g,
        replacement: 'text-[#2ec4b6]',
        description: 'Blue text to teal'
    },
    {
        pattern: /border-blue-500/g,
        replacement: 'border-[#2ec4b6]',
        description: 'Blue border to teal'
    },
    {
        pattern: /bg-teal-500/g,
        replacement: 'bg-[#2ec4b6]',
        description: 'Teal'
    },

    // Hover states
    {
        pattern: /hover:bg-emerald-700/g,
        replacement: 'hover:bg-[#2d6a4f]',
        description: 'Hover emerald'
    },
    {
        pattern: /hover:bg-emerald-600/g,
        replacement: 'hover:bg-[#74c69d]',
        description: 'Hover emerald 600'
    },
];

// Process files
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let changes = [];

        replacements.forEach(({ pattern, replacement, description }) => {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, replacement);
                modified = true;
                changes.push(`  - ${description}: ${matches.length} instances`);
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Updated: ${filePath}`);
            changes.forEach(change => console.log(change));
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
function main() {
    console.log('🎨 Starting Color Migration...\n');

    const srcDir = path.join(__dirname, '../src');
    const pattern = path.join(srcDir, '**/*.{jsx,js,tsx,ts}');

    glob(pattern, {}, (err, files) => {
        if (err) {
            console.error('Error finding files:', err);
            return;
        }

        let updatedCount = 0;
        files.forEach(file => {
            if (processFile(file)) {
                updatedCount++;
            }
        });

        console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
        console.log('\n📝 Next steps:');
        console.log('1. Review changes with: git diff');
        console.log('2. Test the application thoroughly');
        console.log('3. Check COLOR_MIGRATION_GUIDE.md for manual updates needed');
    });
}

main();

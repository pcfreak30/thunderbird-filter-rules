import { format } from '@remusao/thunderbird-msg-filters';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { transformToThunderbird } from './transform';
import type { Rule } from './schema';

async function isCategory(dirPath: string): Promise<boolean> {
    const contents = await fs.readdir(dirPath, { withFileTypes: true });
    const hasSubDirs = contents.some(entry => entry.isDirectory());
    const hasYamls = contents.some(entry =>
        entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))
    );

    return hasSubDirs && !hasYamls;
}

async function loadCategoryRules(categoryPath: string): Promise<Rule[]> {
    const yamlFiles = await fs.readdir(categoryPath, { withFileTypes: true });

    const rules = await Promise.all(
        yamlFiles
            .filter(file => file.isFile() && (file.name.endsWith('.yml') || file.name.endsWith('.yaml')))
            .map(async file => {
                const filePath = path.join(categoryPath, file.name);
                const content = await fs.readFile(filePath, 'utf-8');
                const parsed = yaml.parse(content);

                if (!parsed?.rules || !Array.isArray(parsed.rules)) {
                    throw new Error(`Invalid or missing 'rules' in file: ${filePath}`);
                }

                return parsed.rules as Rule[];
            })
    );

    return rules.flat();
}

async function processFile(directory: string): Promise<void> {
    try {
        const rules = await loadCategoryRules(directory);
        const tbRules = transformToThunderbird(rules);
        const formattedRules = format(tbRules);

        const relativePath = path.relative(path.join(process.cwd(), 'rules'), directory);
        const normalizedCategory = relativePath.replace(/[/\\]/g, '-');
        const outputDir = path.join(process.cwd(), 'dist', normalizedCategory);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(path.join(outputDir, 'msgFilterRules.dat'), formattedRules);
    } catch (err) {
        console.error(`Error processing directory ${directory}:`, err);
    }
}

async function processDirectory(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(entryPath);
        } else if (entry.isFile() && entry.name.endsWith('.yml') && !(await isCategory(directory))) {
            await processFile(directory);
        }
    }
}

async function generateRuleFiles(directory = path.join(process.cwd(), 'rules')) {
    try {
        await processDirectory(directory);
    } catch (err) {
        console.error('Error generating rule files:', err);
    }
}

generateRuleFiles();

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

async function loadCategoryRules(categoryPath: string): Promise<[string, Rule[]]> {
    const category = path.basename(categoryPath);
    const allFiles = await fs.readdir(categoryPath, { withFileTypes: true });

    const yamlFiles = allFiles.filter(file =>
        file.isFile() && (file.name.endsWith('.yml') || file.name.endsWith('.yaml'))
    );

    const rules = await Promise.all(
        yamlFiles.map(async file => {
            const filePath = path.join(categoryPath, file.name);
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = yaml.parse(content);
            return parsed.rules as Rule[];
        })
    );

    return [category, rules.flat()];
}

async function generateRuleFiles(directory = path.join(process.cwd(), 'rules')) {
    const categories = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of categories) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await generateRuleFiles(entryPath);
        } else {
            if (await isCategory(entryPath)) continue;

            const [category, rules] = await loadCategoryRules(entryPath);
            const tbRules = transformToThunderbird(rules);
            const formattedRules = format(tbRules);

            const relativePath = path.relative(path.join(process.cwd(), 'rules'), directory);
            const normalizedCategory = relativePath.replace(/[/\\]/g, '-');
            const outputDir = path.join(process.cwd(), 'dist', normalizedCategory);

            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(
                path.join(outputDir, `${category}.dat`),
                formattedRules
            );
        }
    }
}


generateRuleFiles();

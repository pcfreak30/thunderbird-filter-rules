import type { RuleConfig } from './types';

export function validateRuleConfig(config: RuleConfig) {
    if (!config.name || typeof config.name !== 'string') {
        throw new Error(`Invalid rule name: ${config.name}`);
    }

    if (!Array.isArray(config.actions) || config.actions.length === 0) {
        throw new Error(`Rule ${config.name} must have at least one action`);
    }

    if (!Array.isArray(config.patterns) || config.patterns.length === 0) {
        throw new Error(`Rule ${config.name} must have at least one pattern`);
    }

    config.actions.forEach(action => {
        if (!action.name) {
            throw new Error(`Action in rule ${config.name} must have a name`);
        }
    });

    config.patterns.forEach(pattern => {
        if (!pattern.description || !pattern.condition) {
            throw new Error(`Pattern in rule ${config.name} must have description and condition`);
        }
    });
}

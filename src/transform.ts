// @ts-ignore
import type { Rules } from '@remusao/thunderbird-msg-filters';
import { MatchField, MatchType, RuleAction, type Rule } from './schema';

const TB_ACTIONS: Record<RuleAction, string[]> = {
    [RuleAction.DELETE]: ['Delete'],
    [RuleAction.MARK_READ]: ['Mark read'],
    [RuleAction.MARK_SPAM]: ['JunkScore', 'Mark read'],
    [RuleAction.MOVE]: ['Move to folder'],
    [RuleAction.TAG]: ['AddTag'],
    [RuleAction.ARCHIVE]: ['Move to folder']
};

const TB_ACTION_VALUES: Partial<Record<RuleAction, string>> = {
    [RuleAction.MARK_SPAM]: '100'
};

function buildCondition(rule: Rule): string {
    const operator = rule.conditions.matchAll ? 'AND' : 'OR';
    const conditions = rule.conditions.matches.map(match => {
        let field = match.field.toLowerCase();
        if (field === MatchField.HEADERS) field = 'header';
        return `(${field},${match.type},${match.value})`; // Use match.type directly
    });

    return conditions.length === 1
        ? conditions[0]
        : `${operator} ${conditions.join(` ${operator} `)}`;
}

export function transformToThunderbird(rules: Rule[]): Rules {
    return {
        version: '9' as const,
        logging: 'no' as const,
        rules: rules.map(rule => ({
            name: rule.name,
            enabled: 'yes' as const,
            type: '17' as const,
            actions: rule.actions.flatMap(action => {
                const tbActions = TB_ACTIONS[action.type];
                return tbActions.map(name => ({
                    name,
                    value: action.value ?? TB_ACTION_VALUES[action.type]
                }));
            }),
            condition: buildCondition(rule)
        }))
    };
}

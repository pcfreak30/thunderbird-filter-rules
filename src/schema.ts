// src/schema.ts
export enum RuleAction {
    DELETE = 'delete',
    MARK_READ = 'read',
    MARK_SPAM = 'spam',
    MOVE = 'move',
    TAG = 'tag',
    ARCHIVE = 'archive'
}

export enum MatchField {
    FROM = 'from',
    TO = 'to',
    SUBJECT = 'subject',
    BODY = 'body',
    HEADERS = 'headers'
}

export enum MatchType {
    CONTAINS = 'contains',
    IS = 'is',
    REGEX = 'regex'
}

export interface MatchCondition {
    field: MatchField;
    type: MatchType;
    value: string;
}

export interface Rule {
    id: string;
    name: string;
    conditions: {
        matchAll: boolean;
        matches: MatchCondition[];
    };
    actions: {
        type: RuleAction;
        value?: string; // For MOVE/TAG actions
    }[];
}

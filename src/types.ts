export interface Action {
    name: string;
    value?: string;
}

export interface Pattern {
    description: string;
    condition: string;
}

export interface RuleConfig {
    name: string;
    type?: '17' | '145';  // Make optional, default in transform
    actions: Action[];
    patterns: Pattern[];
}

export interface ThunderbirdRule {
    name: string;
    enabled: 'yes' | 'no';
    type: '17' | '145';
    actions: Action[];
    condition: string;
}

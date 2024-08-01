// TypeScript constant for React components converted from AngularJS

export const orderActions = {
    discontinue: 'DISCONTINUE',
    new: 'NEW',
    revise: 'REVISE'
} as const;

export type OrderActions = typeof orderActions[keyof typeof orderActions];

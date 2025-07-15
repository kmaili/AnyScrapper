// src/app/models/step.model.ts
import { Action } from './action.model';
import { Condition } from './condition.model';
import { Loop } from './loop.model';

export type Step = Action | Condition | Loop;
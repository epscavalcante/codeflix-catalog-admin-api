import { MaxLength, MinLength } from 'class-validator';
import Category from './category.aggregate';

export class CategoryRules {
    @MinLength(3, { groups: ['name'] })
    @MaxLength(255, { groups: ['name'] })
    name: string;

    constructor(category: Category) {
        Object.assign(this, category);
    }
}

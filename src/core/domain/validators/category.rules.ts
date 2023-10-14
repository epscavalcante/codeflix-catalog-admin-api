import { MaxLength, MinLength } from "class-validator";
import Category from "../entities/category.entity";

export class CategoryRules {
    @MinLength(3, { groups: ["name"] })
    @MaxLength(255, { groups: ["name"] })
    name: string;

    constructor(category: Category) {
        Object.assign(this, category);
    }
}

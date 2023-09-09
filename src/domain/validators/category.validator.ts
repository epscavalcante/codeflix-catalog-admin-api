import { CategoryRules } from "./category.class-validator";
import { Validator } from "./validator";
import Category from "domain/entities/category.entity";

export default class CategoryValidator extends Validator<CategoryRules> {
    validate(entity: Category) {
        return super.validate(new CategoryRules(entity));
    }
}

export class CategoryValidatorFactory {
    static create() {
        return new CategoryValidator();
    }    
}

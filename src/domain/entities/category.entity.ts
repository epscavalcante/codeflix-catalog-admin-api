import Uuid from "../value-objects/uuid.vo";
import Entity from "./entity";
import EntityValidationError from "../exceptions/entity-validation-error.exception";
import ValueObject from "../value-objects/value-object";
import { CategoryValidatorFactory } from "../validators/category.validator";
import CategoryFactory from "../factories/category.factory";

export default class Category extends Entity {
    categoryId: Uuid;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;

    constructor(props: CategoryProps) {
        super();
        this.categoryId = props.categoryId ?? new Uuid();
        this.name = props.name;
        this.description = props.description ?? null;
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt ?? new Date();
    }

    static create(props: CategoryCreateCommand): Category {
        const category = new Category(props);

        category.validate(['name']);

        return category;
    }

    validate(fields?: string[]) {
        const categoryValidator = CategoryValidatorFactory.create();

        return categoryValidator.validate(this.notification, this, fields);
    }

    static fake() {
        return CategoryFactory; 
    }

    changeName(name: string): void {
        this.name = name;

        this.validate(['name']);
    }

    changeDescription(description: string): void {
        this.description = description;
    }

    activate(): void {
        this.isActive = true;
    }

    deactivate(): void {
        this.isActive = false;
    }

    toJSON() {
        return {
            categoryId: this.categoryId,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            createdAt: this.createdAt,
        }
    }

    get entityId(): ValueObject {
        return this.categoryId;
    }
}

export type CategoryProps = {
    categoryId?: Uuid;
    name: string;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
}

export type CategoryCreateCommand = {
    name: string;
    description?: string;
    isActive?: boolean;
}
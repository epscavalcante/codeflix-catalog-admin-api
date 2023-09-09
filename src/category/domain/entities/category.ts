import EntityId from "../../../shared/domain/value-objects/entity-id.vo";

export default class Category {
    categoryId: string | EntityId;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;

    constructor(props: CategoryProps) {
        this.categoryId = props.categoryId || new EntityId();
        this.name = props.name;
        this.description = props.description ?? null;
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt ?? new Date();
    }

    // Factory
    static create(props: CategoryCreateCommand): Category {
        return new Category(props);
    }

    changeName(name: string): void {
        this.name = name;
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
            createdAt: this.createdAt.toJSON(),
        }
    }
}

export type CategoryProps = {
    categoryId?: string | EntityId;
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
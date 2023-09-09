import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import Category from "domain/entities/category.entity";

export class CategoryRules {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description: string | null;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    constructor({name, description, isActive}: Category) {
        Object.assign(this, {name, description, isActive});
    }
}
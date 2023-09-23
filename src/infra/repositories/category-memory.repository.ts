import Category from "../../domain/entities/category.entity";
import MemoryRespository from "./memory.repository";
import Uuid from "../../domain/value-objects/uuid.vo";

export default class CategoryMemoryRespository extends MemoryRespository<Category, Uuid> {
    getEntity(): new (...args: any[]) => Category {
        return Category;
    }
}
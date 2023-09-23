import Category from "domain/entities/category.entity";
import IRepository from "./repository";
import Uuid from "domain/value-objects/uuid.vo";

export default interface ICategoryInterface extends IRepository<Category, Uuid> {}
import { UpdateCategoryInput } from '@core/category/application/use-cases/mappers/update-category-input.use-case';
import { OmitType } from '@nestjs/mapped-types';
class UpdateCategoryDtoWithoutId extends OmitType(UpdateCategoryInput, [
    'id',
] as const) {}

export class UpdateCategoryDto extends UpdateCategoryDtoWithoutId {}

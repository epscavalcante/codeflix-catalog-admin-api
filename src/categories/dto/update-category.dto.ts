import { OmitType } from '@nestjs/mapped-types';
import { UpdateCategoryInput } from '../../core/application/use-cases/category/update-category-input.use-case';

class UpdateCategoryDtoWithoutId extends OmitType(UpdateCategoryInput, [
    'id',
] as const) {}

export class UpdateCategoryDto extends UpdateCategoryDtoWithoutId {}

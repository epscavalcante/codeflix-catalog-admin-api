import { UpdateGenreInput } from '@core/genre/application/mappers/update-genre.use-case.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateGenreInputWithoutId extends OmitType(UpdateGenreInput, [
    'id',
] as any) {}

export class UpdateGenreDto extends UpdateGenreInputWithoutId {}

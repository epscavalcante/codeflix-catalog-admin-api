import { MaxLength, MinLength } from 'class-validator';
import Genre from './genre.aggregate';

export default class GenreRules {
    @MinLength(3, { groups: ['name'] })
    @MaxLength(255, { groups: ['name'] })
    name: string;

    constructor(genre: Genre) {
        Object.assign(this, genre);
    }
}

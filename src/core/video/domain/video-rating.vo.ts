import ValueObject from '@core/shared/domain/value-objects/value-object';
import { VideoRatingClassificationError } from './errors/video-rating.error';
import { Either } from '@core/shared/domain/either';

export enum RatingClassifications {
    RL = 'RL',
    R10 = '10',
    R12 = '12',
    R14 = '14',
    R16 = '16',
    R18 = '18',
}

export default class Rating extends ValueObject {
    private constructor(readonly value: RatingClassifications) {
        super();
        this.validate();
    }

    private validate() {
        const isValid = Object.values(RatingClassifications).includes(
            this.value,
        );

        if (!isValid) throw new VideoRatingClassificationError(this.value);
    }

    static create(
        value: RatingClassifications,
    ): Either<Rating | null, VideoRatingClassificationError | null> {
        return Either.safe(() => new Rating(value));
    }

    static createRL(): Rating {
        return new Rating(RatingClassifications.RL);
    }

    static createR10(): Rating {
        return new Rating(RatingClassifications.R10);
    }

    static createR12(): Rating {
        return new Rating(RatingClassifications.R12);
    }

    static createR14(): Rating {
        return new Rating(RatingClassifications.R14);
    }

    static createR16(): Rating {
        return new Rating(RatingClassifications.R16);
    }

    static createR18(): Rating {
        return new Rating(RatingClassifications.R18);
    }

    static with = (value: RatingClassifications) => new Rating(value);
}

import { RatingClassifications } from '../video-rating.vo';

export class VideoRatingClassificationError extends Error {
    constructor(rating: any) {
        super(
            `The rating must be one of the following options: ${Object.values(
                RatingClassifications,
            ).join(', ')}. Passed value: ${rating}`,
        );
        this.name = 'VideoRatingClassificationError';
    }
}

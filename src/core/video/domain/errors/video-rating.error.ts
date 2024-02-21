import { RatingClassifications } from '../video-rating.vo';

export class VideoRatingClassificationError extends Error {
    constructor(rating: any) {
        super(
            `Invalid rating classification: ${rating}. Availables: ${Object.values(
                RatingClassifications,
            ).join(', ')}`,
        );
        this.name = 'VideoRatingClassificationError';
    }
}

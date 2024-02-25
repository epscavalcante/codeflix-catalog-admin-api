import { VideoRatingClassificationError } from './errors/video-rating.error';
import Rating, { RatingClassifications } from './video-rating.vo';

describe('Rating Value Object', () => {
    it('should fail to create a Rating with invalid value', () => {
        expect(() => Rating.with('invalid' as any)).toThrow(
            VideoRatingClassificationError,
        );
    });

    it('should create a Rating with RL value', () => {
        const rating = Rating.createRL();
        expect(rating.value).toBe(RatingClassifications.RL);
    });

    it('should create a Rating with R10 value', () => {
        const rating = Rating.createR10();
        expect(rating.value).toBe(RatingClassifications.R10);
    });

    it('should create a Rating with R12 value', () => {
        const rating = Rating.createR12();
        expect(rating.value).toBe(RatingClassifications.R12);
    });

    it('should create a Rating with R14 value', () => {
        const rating = Rating.createR14();
        expect(rating.value).toBe(RatingClassifications.R14);
    });

    it('should create a Rating with R16 value', () => {
        const rating = Rating.createR16();
        expect(rating.value).toBe(RatingClassifications.R16);
    });

    it('should create a Rating with R18 value', () => {
        const rating = Rating.createR18();
        expect(rating.value).toBe(RatingClassifications.R18);
    });
});

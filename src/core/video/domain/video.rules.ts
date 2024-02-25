import { MaxLength, MinLength } from 'class-validator';
import Video from './video.aggregate';

export default class VideoRules {
    @MinLength(3, { groups: ['title'] })
    @MaxLength(255, { groups: ['title'] })
    title: string;

    constructor(video: Video) {
        Object.assign(this, video);
    }
}

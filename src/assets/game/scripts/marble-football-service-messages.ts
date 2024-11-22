export namespace MarbleFootballServiceMessages {
    export class VideoStream {
        firstHalfVideo: string;
        secondHalfVideo: string;
        firstHalfTimeline: number[];
        secondHalfTimeline: number[];

        static eventName = "videoResult";
    }
}

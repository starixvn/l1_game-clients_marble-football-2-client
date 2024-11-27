export namespace MarbleFootballServiceMessages {
    export class VideoStream {
        firstHalfVideo: string;
        secondHalfVideo: string;
        firstHalfTimeline: number[];
        secondHalfTimeline: number[];
        liveStreamServer: string;
        firstHalf: string;
        secondHalf: string;

        static eventName = "videoResult";
    }
}

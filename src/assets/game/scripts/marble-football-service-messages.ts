export namespace MarbleFootballServiceMessages {
    type MatchType = {
        id: number;
        home: string;
        away: string;
    };

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

    export class Tournament {
        code: string;
        matches: MatchType[];
        currentMatch: number;
        ended: boolean;

        static eventName = "tournament";
    }
}

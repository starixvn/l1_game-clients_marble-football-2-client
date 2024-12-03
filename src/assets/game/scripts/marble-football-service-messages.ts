export namespace MarbleFootballServiceMessages {
    export type MatchType = {
        home: string;
        away: string;
        id?: number;
        homeWins?: boolean;
    };

    export class VideoStream {
        firstHalfVideo: string;
        secondHalfVideo: string;
        firstHalfTimeline: number[];
        secondHalfTimeline: number[];
        firstHalf: string;
        secondHalf: string;

        static eventName = "videoResult";
    }

    export class LiveStreamServer {
        static eventName = "liveStreamServer";
    }

    export class Tournament {
        code: string;
        matches: MatchType[];
        currentMatch: number;
        ended: boolean;

        static eventName = "tournament";
    }
}

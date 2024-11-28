import { settings } from "./../../game-settings";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

export type StreamingVideo = {
    videoName: string;
    liveStreamServer: string;
};

@injectable()
export class VideoStreamStore {
    @inject(gc.Rounds.RoundTimeStore) private readonly roundTimeStore: gc.Rounds.RoundTimeStore;

    private _videoResult: MarbleFootballServiceMessages.VideoStream = {} as any;
    private _currentVideo: StreamingVideo = {} as any;
    private _homeScore = 0;
    private _awayScore = 0;
    private _currentVideoTime = -1;

    constructor() {
        mobx.makeAutoObservable(this);

        setTimeout(() => {
            if (this.roundTimeStore) {
                mobx.reaction(
                    () => this.roundTimeStore.roundTime,
                    (roundTime) => this.updateCurrentVideoAndScores(roundTime)
                );
            } else {
                console.error("roundTimeStore is not defined. Dependency injection might be misconfigured.");
            }
        }, 0);
    }

    updateCurrentVideoAndScores(roundTime: number) {
        this._currentVideoTime = this.calculateCurrentVideoTime(roundTime);

        if (this._currentVideoTime === -1) {
            return;
        }

        const isFirstHalf = roundTime > settings.durations.videoDuration;

        const videoName = isFirstHalf ? this._videoResult.firstHalfVideo : this._videoResult.secondHalfVideo;
        const videoTimeline = isFirstHalf ? this._videoResult.firstHalfTimeline ?? [] : this._videoResult.secondHalfTimeline;
        const videoResult = isFirstHalf ? this._videoResult.firstHalf : this._videoResult.secondHalf;

        if (this._currentVideo.videoName !== videoName) {
            this._currentVideo = {
                videoName,
                liveStreamServer: this._videoResult.liveStreamServer,
            };
        }

        const currentScoreIndex = videoTimeline.findIndex((scoreTime) => Math.ceil(scoreTime) === this._currentVideoTime);

        if (currentScoreIndex !== -1) {
            this.updateScores(videoResult[currentScoreIndex]);
        }
    }

    calculateCurrentVideoTime(roundTime: number) {
        if (roundTime > settings.durations.streamingVideo) {
            return -1;
        }

        if (roundTime <= settings.durations.streamingVideo && roundTime > settings.durations.videoDuration) {
            const videoTime = settings.durations.streamingVideo - roundTime;
            return videoTime <= settings.durations.videoDuration ? videoTime : -1;
        }

        if (roundTime <= settings.durations.videoDuration && roundTime >= 0) {
            return settings.durations.videoDuration - roundTime;
        }

        return -1;
    }

    set videoResult(source: MarbleFootballServiceMessages.VideoStream) {
        this._videoResult = source;
        this.resetScores();
    }

    get currentVideo(): StreamingVideo {
        return this._currentVideo;
    }

    get homeScore(): number {
        return this._homeScore;
    }

    get awayScore(): number {
        return this._awayScore;
    }

    get currentVideoTime(): number {
        return this._currentVideoTime;
    }

    private resetScores(): void {
        this._homeScore = 0;
        this._awayScore = 0;
    }

    private updateScores(goal: string): void {
        if (goal === "H") {
            this._homeScore++;
        } else if (goal === "A") {
            this._awayScore++;
        }
    }
}

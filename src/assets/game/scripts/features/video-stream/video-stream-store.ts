import { settings } from "./../../game-settings";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

export type StreamingVideo = {
    videoName: string;
    liveStreamServer: string;
    time: number;
};

type VideoData = {
    videoName: string;
    videoResult: string;
    videoTimeline: number[];
};

@injectable()
export class VideoStreamStore {
    @inject(gc.Rounds.RoundTimeStore) private readonly roundTimeStore: gc.Rounds.RoundTimeStore;

    private _videoResult: MarbleFootballServiceMessages.VideoStream = {} as any;
    private _currentVideo: StreamingVideo = {} as any;
    private _homeScore = 0;
    private _awayScore = 0;
    private _currentVideoTime = -1;
    private _roundTime = -1;
    private _isFirstHalf = true;
    private _isFirstLoad = true;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    updateWithRoundTime(roundTime: number) {
        this._roundTime = roundTime;
        this._currentVideoTime = this.calculateCurrentVideoTime();
        this._isFirstHalf = roundTime > settings.durations.videoDuration;

        this.updateCurrentVideoAndScores();
    }

    updateCurrentVideoAndScores() {
        const currentVideoTime = this._currentVideoTime;
        const videoData = this.getVideoData();

        if (!videoData) return;

        if (this._isFirstLoad) {
            this.updateScoresBeforeCurrentTime(videoData, currentVideoTime);
            this._isFirstLoad = false;
        }

        if (currentVideoTime === -1) {
            return;
        }

        if (this._currentVideo.videoName !== videoData.videoName) {
            this._currentVideo = {
                videoName: videoData.videoName,
                liveStreamServer: this._videoResult.liveStreamServer,
                time: currentVideoTime,
            };
        }

        this.updateCurrentScores(videoData, currentVideoTime);
    }

    private updateScoresBeforeCurrentTime(videoData: VideoData, currentVideoTime: number) {
        let homeScore = 0;
        let awayScore = 0;

        if (this._roundTime < settings.durations.streamingVideo - settings.durations.videoDuration) {
            homeScore = this._videoResult.firstHalf.split("H").length - 1;
            awayScore = this._videoResult.firstHalf.split("A").length - 1;
        }

        if (this._roundTime > settings.durations.placingBet + settings.durations.startRound) {
            homeScore += this._videoResult.secondHalf.split("H").length - 1;
            awayScore += this._videoResult.secondHalf.split("A").length - 1;
        }

        if (currentVideoTime > 0) {
            videoData.videoTimeline.forEach((scoreTime, index) => {
                if (Math.ceil(scoreTime) < currentVideoTime) {
                    const goal = videoData.videoResult[index];

                    if (goal === "H") {
                        homeScore++;
                    } else if (goal === "A") {
                        awayScore++;
                    }
                }
            });
        }

        this._homeScore = homeScore;
        this._awayScore = awayScore;
    }

    private updateCurrentScores(videoData: VideoData, currentVideoTime: number) {
        const currentScoreIndex = videoData.videoTimeline.findIndex((scoreTime) => Math.ceil(scoreTime) === currentVideoTime);

        if (currentScoreIndex !== -1) {
            const goal = videoData.videoResult[currentScoreIndex];

            if (goal === "H") {
                this._homeScore++;
            } else if (goal === "A") {
                this._awayScore++;
            }
        }
    }

    private getVideoData(): VideoData {
        const isFirstHalf = this._isFirstHalf;

        const videoName = isFirstHalf ? this._videoResult.firstHalfVideo : this._videoResult.secondHalfVideo;
        const videoTimeline = isFirstHalf ? this._videoResult.firstHalfTimeline : this._videoResult.secondHalfTimeline;
        const videoResult = isFirstHalf ? this._videoResult.firstHalf : this._videoResult.secondHalf;

        if (!videoName || !videoTimeline || !videoResult) return null;

        return { videoName, videoTimeline, videoResult };
    }

    calculateCurrentVideoTime() {
        const roundTime = this._roundTime;

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

    get isFirstHalf(): boolean {
        return this._isFirstHalf;
    }

    resetForNewRound() {
        this._currentVideoTime = -1;
        this._currentVideo = {} as any;
        this._videoResult = {} as any;
        this._isFirstHalf = true;
        this.resetScores();
    }

    private resetScores(): void {
        this._homeScore = 0;
        this._awayScore = 0;
    }
}

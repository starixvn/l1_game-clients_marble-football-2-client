import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { settings } from "./../../game-settings";

const { injectable } = inversify;

export type StreamingVideo = {
    videoName: string;
    time: number;
    isFirstHalf: boolean;
};

type VideoData = {
    videoName: string;
    videoResult: string;
    videoTimeline: number[];
};

@injectable()
export class VideoStreamStore {
    private _videoResult: MarbleFootballServiceMessages.VideoStream = {} as any;
    private _currentVideo: StreamingVideo = {} as any;
    private _homeScore = 0;
    private _awayScore = 0;
    private _currentVideoTime = -1;
    private _roundTime = -1;
    private _isFirstHalf = true;
    private _isFirstLoad = true;
    private _isBreakTime = false;
    private _currentMatchTime = 0;
    private _isLiveVideo = false;
    private _isSecondHalf = false;
    private _isLoadFirstHalf = false;
    private _isPlayVideo = false;

    liveStreamServer = "";

    constructor() {
        mobx.makeAutoObservable(this);
    }

    updateWithRoundTime(roundTime: number) {
        this._roundTime = roundTime;
        this._currentVideoTime = this.calculateCurrentVideoTime();
        this._isLoadFirstHalf = roundTime > settings.points.placingBetLiveMatch;

        if (this._currentVideoTime > 0 && this._currentVideoTime <= settings.durations.halfDuration) {
            this._currentMatchTime++;
        }

        const endOfFirstHalf = settings.points.streamingFirstHalfVideo - settings.durations.videoDuration;

        this._isFirstHalf = roundTime > endOfFirstHalf && roundTime <= settings.points.placingBetPreMatch + settings.durations.startRound;

        this._isBreakTime = roundTime <= endOfFirstHalf && roundTime > endOfFirstHalf - settings.durations.breakTime;

        this._isLiveVideo = !this._isBreakTime && roundTime >= 0 && roundTime <= settings.points.streamingFirstHalfVideo;

        this._isSecondHalf = roundTime >= 0 && roundTime <= settings.points.streamingSecondHalfVideo;

        this.updateCurrentVideoAndScores();
    }

    updateCurrentVideoAndScores() {
        const currentVideoTime = this._currentVideoTime;
        const videoData = this.getVideoData();

        if (!videoData) {
            return;
        }

        if (this._isFirstLoad) {
            const currentMatchTime = this.calculateCurrentMatchTime();
            this._currentMatchTime = currentMatchTime;
            this.updateScoresBeforeCurrentTime(videoData, currentMatchTime);
            this._isFirstLoad = false;
        }

        if (currentVideoTime === -1) {
            return;
        }

        if (this._currentVideo.videoName !== videoData.videoName || this._currentVideo.isFirstHalf !== this.isFirstHalf) {
            this._currentVideo = {
                videoName: videoData.videoName,
                time: currentVideoTime,
                isFirstHalf: this._isFirstHalf,
            };
        }

        this.updateCurrentScores(videoData, currentVideoTime);
    }

    private updateScoresBeforeCurrentTime(videoData: VideoData, currentMatchTime: number) {
        let homeScore = 0;
        let awayScore = 0;

        let time = currentMatchTime;

        if (time >= settings.durations.halfDuration) {
            homeScore = this._videoResult.firstHalf?.split("H").length - 1;
            awayScore = this._videoResult.firstHalf?.split("A").length - 1;
            time -= settings.durations.halfDuration;
        }

        if (time >= settings.durations.halfDuration) {
            homeScore += this._videoResult.secondHalf?.split("H").length - 1;
            awayScore += this._videoResult.secondHalf?.split("A").length - 1;
            time -= settings.durations.halfDuration;
        }

        if (time > 0) {
            videoData.videoTimeline.forEach((scoreTime, index) => {
                if (Math.ceil(scoreTime) < time) {
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
        const isSecondHalf = this._isSecondHalf;

        const videoName = isSecondHalf ? this._videoResult.secondHalfVideo : this._videoResult.firstHalfVideo;
        const videoTimeline = isSecondHalf ? this._videoResult.secondHalfTimeline : this._videoResult.firstHalfTimeline;
        const videoResult = isSecondHalf ? this._videoResult.secondHalf : this._videoResult.firstHalf;

        if (!videoTimeline || !videoResult) {
            return null;
        }

        return { videoName, videoTimeline, videoResult };
    }

    calculateCurrentVideoTime() {
        const roundTime = this._roundTime;

        if (roundTime > settings.points.streamingFirstHalfVideo) {
            return -1;
        }

        const endOfFirstHalfVideoTime = settings.points.streamingFirstHalfVideo - settings.durations.videoDuration;

        if (roundTime <= settings.points.streamingFirstHalfVideo && roundTime >= endOfFirstHalfVideoTime) {
            const videoTime = settings.points.streamingFirstHalfVideo - roundTime;
            return videoTime <= settings.durations.videoDuration ? videoTime : -1;
        }

        const streamingSecondHalfVideoTime =
            settings.points.streamingFirstHalfVideo - settings.durations.videoDuration - settings.durations.breakTime;

        if (roundTime <= streamingSecondHalfVideoTime && roundTime >= 0) {
            return streamingSecondHalfVideoTime - roundTime;
        }

        return -1;
    }

    calculateCurrentMatchTime() {
        const roundTime = this._roundTime;

        if (roundTime > settings.points.placingBetPreMatch + settings.durations.startRound) {
            return settings.durations.halfDuration * 2;
        }

        if (roundTime <= settings.points.streamingFirstHalfVideo && roundTime > settings.points.streamingSecondHalfVideo) {
            const matchTime = settings.points.streamingFirstHalfVideo - roundTime;
            return matchTime < settings.durations.halfDuration ? matchTime : settings.durations.halfDuration;
        }

        if (roundTime <= settings.points.streamingSecondHalfVideo && roundTime >= 0) {
            const secondHalfTime = settings.points.streamingSecondHalfVideo - roundTime;
            return secondHalfTime < settings.durations.halfDuration
                ? secondHalfTime + settings.durations.halfDuration
                : settings.durations.halfDuration * 2;
        }

        return 0;
    }

    set videoResult(source: MarbleFootballServiceMessages.VideoStream) {
        this._videoResult = {
            ...this._videoResult,
            ...source,
        };
    }

    get videoResult(): MarbleFootballServiceMessages.VideoStream {
        return this._videoResult;
    }

    get isBreakTime(): boolean {
        return this._isBreakTime;
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

    get currentMatchTime(): number {
        return this._currentMatchTime;
    }

    get isLiveVideo(): boolean {
        return this._isLiveVideo;
    }

    get isSecondHalf(): boolean {
        return this._isSecondHalf;
    }

    get isLoadFirstHalf(): boolean {
        return this._isLoadFirstHalf;
    }

    get isPlayVideo(): boolean {
        return this._isPlayVideo;
    }

    set isPlayVideo(value: boolean) {
        this._isPlayVideo = value;
    }

    resetForNewRound() {
        this._currentVideoTime = -1;
        this._currentVideo = {} as any;
        this._videoResult = {} as any;
        this._isFirstHalf = true;
        this._currentMatchTime = 0;
        this.resetScores();
    }

    private resetScores(): void {
        this._homeScore = 0;
        this._awayScore = 0;
    }
}

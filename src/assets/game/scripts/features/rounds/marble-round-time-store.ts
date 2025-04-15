import mobx from "mobx";
import inversify from "inversify";
const { injectable, inject } = inversify;
import gc from "@sg/game-client-base";
import { MarbleGameSetting } from "../game-configs/marble-game-setting";

export const MARBLE_ROUND_STATE = {
    START_GAME_LOOP: "startGameLoop",
    STARTING_ROUND: "startingRound",
    PLACING_BET: "placingBet",
    LOCKING_BET: "lockingBet",
    WAITING: "waiting",
    SHOW_ANIMATION_RESULT: "showAnimationResult",
    SHOW_RESULT: "showResult",
    CHANGE_REMAINING_TIME: "changeRemainingTime",
    STOP_GAME_LOOP: "stopGameLoop",
    PLAYING_VIDEO: "playingVideo",
    HALF_TIME: "halfTime",
    INTRO_VIDEO: "introVideo",
    NONE: "none",
};

const RoundTimeInitValue = -99999;

@injectable()
export class MarbleRoundTimeStore {
    @inject(gc.GameConfigs.GameSetting) readonly gameSetting: MarbleGameSetting;

    private _roundTime = RoundTimeInitValue;
    private _roundState = MARBLE_ROUND_STATE.NONE;
    private _countdownTimer = 0;
    startNewRound = false;
    endRound = false;
    startPlacingBet = false;
    endPlacingBet = false;
    durationShowPromptMessage = 2;
    durationLockingBet = 3;

    constructor() {
        mobx.makeAutoObservable(this);
        this.setDurationShowPromptMessage(this.gameSetting?.durationShowPromptMessage);
    }

    get wholeRound() {
        return this.gameSetting.durations.wholeRound;
    }

    get placingBetPreMatch() {
        return this.gameSetting.points.placingBetPreMatch;
    }

    get placingBetLiveMatch() {
        return this.gameSetting.points.placingBetLiveMatch;
    }

    get blockingBet() {
        return this.gameSetting.durations.lockingBet;
    }

    get lockingBetPreMatch() {
        return this.gameSetting.points.lockingBetPreMatch;
    }

    get lockingBetLiveMatch() {
        return this.gameSetting.points.lockingBetLiveMatch;
    }

    get generatingResult() {
        return this.gameSetting.durations.generatingResult;
    }

    get showingResult() {
        return this.gameSetting.durations.showingResult;
    }

    get startRound() {
        return this.gameSetting.durations.startRound;
    }

    get tournament() {
        return this.gameSetting.durations.tournament;
    }

    get matchWinner() {
        return this.gameSetting.durations.matchWinner;
    }

    get initialized() {
        return this.roundTime !== RoundTimeInitValue;
    }

    get isWaiting() {
        return this.roundTime > this.placingBetPreMatch;
    }

    get isStartWaiting() {
        return this.roundTime === this.wholeRound;
    }

    get placingBet() {
        return this.gameSetting.durations.placingBet;
    }

    get lockingBet() {
        return this.gameSetting.durations.lockingBet;
    }

    get streamingFirstHalfVideo() {
        return this.gameSetting.points.streamingFirstHalfVideo;
    }

    get streamingSecondHalfVideo() {
        return this.gameSetting.points.streamingSecondHalfVideo;
    }

    get durationVideo() {
        return this.gameSetting.durations.videoDuration;
    }

    get pointIntroVideo() {
        return this.gameSetting.points.introVideo;
    }

    get durationIntroVideo() {
        return this.gameSetting.durations.introVideo;
    }

    get durationHalfTime() {
        return this.gameSetting.durations.showHaftTime;
    }

    get isLocking() {
        return (
            ((this.roundTime <= this.lockingBetPreMatch && this.roundTime > this.lockingBetPreMatch - this.durationLockingBet) ||
                (this.roundTime <= this.lockingBetLiveMatch && this.roundTime > this.lockingBetLiveMatch - this.durationLockingBet)) &&
            this.roundTime > 0
        );
    }

    get isLockingPreMatch() {
        return (
            this.roundTime <= this.lockingBetPreMatch &&
            this.roundTime > this.lockingBetPreMatch - this.durationLockingBet &&
            this.roundTime > 0
        );
    }

    get isLockingLiveMatch() {
        return (
            this.roundTime <= this.lockingBetLiveMatch &&
            this.roundTime > this.lockingBetLiveMatch - this.durationLockingBet &&
            this.roundTime > 0
        );
    }

    get isStartLockingPreMatch() {
        return this.roundTime === this.lockingBetPreMatch;
    }

    get isStartLockingLiveMatch() {
        return this.roundTime === this.lockingBetLiveMatch;
    }

    get isStartLocking() {
        return this.isStartLockingPreMatch || this.isStartLockingLiveMatch;
    }

    get isPlacingBet() {
        return this.isPlacingBetPreMatch || this.isPlacingBetLiveMatch;
    }

    get isPlacingBetPreMatch() {
        return this.roundTime <= this.placingBetPreMatch && this.roundTime > this.lockingBetPreMatch;
    }

    get isPlacingBetLiveMatch() {
        return this.roundTime <= this.placingBetLiveMatch && this.roundTime > this.lockingBetLiveMatch;
    }

    get isStartPlacingBet() {
        return this.roundTime === this.placingBetPreMatch || this.roundTime === this.placingBetLiveMatch;
    }

    get isShowAnimationResult() {
        return (this.roundTime <= this.wholeRound && this.roundTime > this.wholeRound - this.generatingResult) || this.roundTime === 0;
    }

    get isShowResult() {
        return (
            this.roundTime <= this.wholeRound - this.generatingResult + 1 &&
            this.roundTime > this.lockingBetPreMatch + this.startRound &&
            this.wholeRound !== 0
        );
    }

    get isStartRound() {
        return this.roundTime === this.placingBetPreMatch + this.startRound;
    }

    get isStartingRound() {
        return this.roundTime <= this.placingBetPreMatch + this.startRound && this.roundTime > this.placingBetPreMatch;
    }

    get isTimeOut() {
        return this.roundTime === 0;
    }

    get isInRoundTime() {
        return this.roundState === MARBLE_ROUND_STATE.PLACING_BET || this.roundState === MARBLE_ROUND_STATE.LOCKING_BET;
    }

    get isShowStartBetMessageLiveMatch() {
        return this.roundTime < this.placingBetLiveMatch + this.durationShowPromptMessage && this.roundTime > this.placingBetLiveMatch;
    }

    get isShowStartBetMessagePreMatch() {
        return this.roundTime < this.placingBetPreMatch + this.durationShowPromptMessage && this.roundTime > this.placingBetPreMatch;
    }

    get isShowStartBetMessage() {
        return this.isShowStartBetMessageLiveMatch || this.isShowStartBetMessagePreMatch;
    }

    get isPreparingBetPreMatch() {
        return this.roundTime === this.placingBetPreMatch - 1;
    }

    get isPlayingVideo() {
        return (
            (this.roundTime <= this.streamingFirstHalfVideo && this.roundTime > this.streamingFirstHalfVideo - this.durationVideo) ||
            (this.roundTime <= this.streamingSecondHalfVideo && this.roundTime > this.streamingSecondHalfVideo - this.durationVideo)
        );
    }

    get isPlayingIntroVideo() {
        return this.roundTime <= this.pointIntroVideo && this.roundTime > this.pointIntroVideo - this.durationIntroVideo;
    }

    get isPlayingHalfTime() {
        return this.roundTime <= this.streamingFirstHalfVideo - this.durationVideo && this.roundTime > this.placingBetLiveMatch;
    }

    get isShowDisabledGameMessage() {
        return this._roundTime <= this.placingBetPreMatch || this._roundTime === this.wholeRound;
    }

    resetRoundTime() {
        this._roundTime = this.wholeRound;
    }

    setDurationShowPromptMessage(durationShowPromptMessage?: number) {
        durationShowPromptMessage && (this.durationShowPromptMessage = durationShowPromptMessage);
    }

    countdown() {
        if (this.roundTime <= 1) {
            this.roundTime = 0;
        } else {
            this.roundTime--;
        }
    }

    get roundTime() {
        return this._roundTime;
    }

    set roundTime(roundTime) {
        this._roundTime = roundTime;
        this.calculateRoundStatus();
    }

    get roundState() {
        return this._roundState;
    }

    set roundState(value: string) {
        this._roundState = value;
    }

    get countdownTimer() {
        return this._countdownTimer;
    }

    calculateRoundStatus() {
        this.roundState = this.getCurrentRoundState();
        if (this.roundTime < 0) {
            return;
        }

        if (this.isShowResult) {
            const duration = this.roundTime - this.placingBetPreMatch - this.startRound;
            this._countdownTimer = duration;
        }

        if (this.isPlacingBetPreMatch) {
            this._countdownTimer = this.roundTime - this.lockingBetPreMatch + this.blockingBet;
        }

        if (this.isPlacingBetLiveMatch) {
            this._countdownTimer = this.roundTime - this.lockingBetLiveMatch + this.blockingBet;
        }

        if (this.isLockingPreMatch) {
            this._countdownTimer = this.roundTime - this.lockingBetPreMatch + this.blockingBet;
        }

        if (this.isLockingLiveMatch) {
            this._countdownTimer = this.roundTime - this.lockingBetLiveMatch + this.blockingBet;
        }
    }

    getCurrentRoundState(): string {
        if (this.roundTime < 0) {
            return MARBLE_ROUND_STATE.WAITING;
        }

        let currentState = "";
        if (this.isWaiting) {
            currentState = MARBLE_ROUND_STATE.WAITING;
        }

        if (this.isShowAnimationResult) {
            currentState = MARBLE_ROUND_STATE.SHOW_ANIMATION_RESULT;
        }

        if (this.isShowResult) {
            currentState = MARBLE_ROUND_STATE.SHOW_RESULT;
        }

        if (this.isStartingRound) {
            currentState = MARBLE_ROUND_STATE.STARTING_ROUND;
        }

        if (this.isPlacingBet) {
            currentState = MARBLE_ROUND_STATE.PLACING_BET;
        }

        if (this.isLocking) {
            currentState = MARBLE_ROUND_STATE.LOCKING_BET;
        }
        if (this.isPlayingVideo) {
            currentState = MARBLE_ROUND_STATE.PLAYING_VIDEO;
        }

        if (this.isPlayingIntroVideo) {
            currentState = MARBLE_ROUND_STATE.INTRO_VIDEO;
        }

        if (this.isPlayingHalfTime) {
            currentState = MARBLE_ROUND_STATE.HALF_TIME;
        }

        return currentState;
    }

    start() {
        this.roundState = MARBLE_ROUND_STATE.START_GAME_LOOP;
    }

    resetRoundTimeStore() {
        this.roundState = MARBLE_ROUND_STATE.STOP_GAME_LOOP;
    }
}

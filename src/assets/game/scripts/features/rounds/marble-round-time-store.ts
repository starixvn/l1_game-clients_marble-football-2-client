import mobx from "mobx";
import inversify from "inversify";
const { injectable, inject } = inversify;
import gc from "@sg/game-client-base";
import { MarbleGameSetting } from "../game-configs/marble-game-setting";

export const ROUND_STATE = {
    START_GAME_LOOP: "startGameLoop",
    STARTING_ROUND: "startingRound",
    PLACING_BET: "placingBet",
    LOCKING_BET: "lockingBet",
    WAITING: "waiting",
    SHOW_ANIMATION_RESULT: "showAnimationResult",
    SHOW_RESULT: "showResult",
    CHANGE_REMAINING_TIME: "changeRemainingTime",
    STOP_GAME_LOOP: "stopGameLoop",
    NONE: "none",
};

const RoundTimeInitValue = -99999;

@injectable()
export class MarbleRoundTimeStore {
    @inject(gc.GameConfigs.GameSetting) readonly gameSetting: MarbleGameSetting;

    private _roundTime = RoundTimeInitValue;
    private _roundState = ROUND_STATE.NONE;
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

    get initialized() {
        return this.roundTime !== RoundTimeInitValue;
    }

    get isWaiting() {
        return this.roundTime > this.placingBetPreMatch;
    }

    get isStartWaiting() {
        return this.roundTime === this.wholeRound;
    }

    get isLocking() {
        return (
            ((this.roundTime <= this.gameSetting.points.lockingBetPreMatch &&
                this.roundTime > this.gameSetting.points.lockingBetPreMatch - this.durationLockingBet) ||
                (this.roundTime <= this.gameSetting.points.lockingBetLiveMatch &&
                    this.roundTime > this.gameSetting.points.lockingBetLiveMatch - this.durationLockingBet)) &&
            this.roundTime > 0
        );
    }

    get isStartLockingPreMatch() {
        return this.roundTime === this.lockingBetPreMatch;
    }

    get isStartLockingLiveMatch() {
        return this.roundTime === this.lockingBetLiveMatch;
    }

    get isPlacingBet() {
        return (
            (this.roundTime <= this.placingBetPreMatch && this.roundTime > this.lockingBetPreMatch) ||
            (this.roundTime <= this.placingBetLiveMatch && this.roundTime > this.lockingBetLiveMatch)
        );
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
        return this.roundState === ROUND_STATE.PLACING_BET || this.roundState === ROUND_STATE.LOCKING_BET;
    }

    get isShowStartBetMessageLiveMatch() {
        return this.roundTime <= this.placingBetLiveMatch + this.durationShowPromptMessage && this.roundTime > this.placingBetLiveMatch;
    }

    get isShowStartBetMessagePreMatch() {
        return this.roundTime <= this.placingBetPreMatch + this.durationShowPromptMessage && this.roundTime > this.placingBetPreMatch;
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
            let duration = this.roundTime - this.placingBetPreMatch - this.startRound;

            this._countdownTimer = duration;
        }

        if (this.isPlacingBet) {
            this._countdownTimer = this.roundTime;
        }

        if (this.isLocking) {
            this._countdownTimer = this.roundTime;
        }
    }

    getCurrentRoundState(): string {
        if (this.roundTime < 0) {
            return ROUND_STATE.WAITING;
        }

        let currentState = "";
        if (this.isWaiting) {
            currentState = ROUND_STATE.WAITING;
        }

        if (this.isShowAnimationResult) {
            currentState = ROUND_STATE.SHOW_ANIMATION_RESULT;
        }

        if (this.isShowResult) {
            currentState = ROUND_STATE.SHOW_RESULT;
        }

        if (this.isStartingRound) {
            currentState = ROUND_STATE.STARTING_ROUND;
        }

        if (this.isPlacingBet) {
            currentState = ROUND_STATE.PLACING_BET;
        }

        if (this.isLocking) {
            currentState = ROUND_STATE.LOCKING_BET;
        }

        return currentState;
    }

    start() {
        this.roundState = ROUND_STATE.START_GAME_LOOP;
    }

    resetRoundTimeStore() {
        this.roundState = ROUND_STATE.STOP_GAME_LOOP;
    }
}

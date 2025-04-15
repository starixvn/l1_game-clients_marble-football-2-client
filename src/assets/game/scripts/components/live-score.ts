import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { LocalizedLabel } from "../../../../extensions/i18n/assets/LocalizedLabel";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import { settings } from "../game-settings";
import { Flag } from "./flag";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("LiveScore")
export class LiveScore extends ObserverComponent {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @property(Label)
    private minutesLabel: Label = null;

    @property(Label)
    private secondsLabel: Label = null;

    @property(Label)
    private half: Label = null;

    seconds = 0;
    minutes = 0;
    stop = false;
    scheduleTimer = () => {
        this.updateTimer();
    };

    onLoad(): void {
        super.onLoad();
    }

    protected update(dt: number): void {
        this.updateTimer();
    }

    setTeams(home: string, away: string) {
        this.home.setIcon(home);
        this.away.setIcon(away);
    }

    @render(VideoStreamStore, (store) => store.isSecondHalf)
    setMatch(isSecondHalf: boolean) {
        const halfLabel = this.half.getComponent(LocalizedLabel);
        halfLabel.key = isSecondHalf ? "MarbleFootball.second_half" : "MarbleFootball.first_half";
        halfLabel.updateLabel();
    }

    @render(VideoStreamStore, (store) => ({
        currentMatchTime: store.currentMatchTime,
        currentVideoTime: store.currentVideoTime,
        isFirstHalf: store.isFirstHalf,
        isBreakTime: store.isBreakTime,
    }))
    setTime({
        currentMatchTime,
        currentVideoTime,
        isFirstHalf,
        isBreakTime,
    }: {
        currentMatchTime: number;
        currentVideoTime: number;
        isFirstHalf: boolean;
        isBreakTime: boolean;
    }) {
        if (currentVideoTime === -1) {
            this.stop = true;
        } else {
            this.stop = false;

            if (currentMatchTime === settings.durations.halfDuration && (isFirstHalf || isBreakTime)) {
                this.stop = true;
            }

            if (currentMatchTime === settings.durations.halfDuration * 2) {
                this.stop = true;
            }
        }

        this.minutes = currentMatchTime;
        this.seconds = 0;
        this.minutesLabel.string = `${this.minutes.toString().padStart(2, "0")}:`;
        this.secondsLabel.string = this.seconds.toString().padStart(2, "0");
    }

    updateTimer() {
        if (this.stop) {
            return;
        }

        if (this.seconds < 59) {
            this.seconds += 1;
        }

        this.secondsLabel.string = this.seconds.toString().padStart(2, "0");
    }
}

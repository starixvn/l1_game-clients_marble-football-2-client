import { _decorator, Label } from "cc";
import { Flag } from "./flag";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { LocalizedLabel } from "../../../../extensions/i18n/assets/LocalizedLabel";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("LiveScore")
export class LiveScore extends ObserverComponent {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @property(Label)
    private time: Label = null;

    @property([Label])
    private half: Label = null;

    onLoad(): void {
        super.onLoad();
    }

    setTeams(home: string, away: string) {
        this.home.setIcon(home);
        this.away.setIcon(away);
    }

    @render(VideoStreamStore, (store) => store.isFirstHalf)
    setMatch(isFirstHalf: boolean) {
        const halfLabel = this.half.getComponent(LocalizedLabel);
        halfLabel.key = isFirstHalf ? "MarbleFootball.first_half" : "MarbleFootball.second_half";
        halfLabel.updateLabel();
    }

    setTime(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const minutesString = minutes.toString().padStart(2, "0");
        const secondsString = seconds.toString().padStart(2, "0");

        this.time.string = `${minutesString}:${secondsString}`;
    }
}

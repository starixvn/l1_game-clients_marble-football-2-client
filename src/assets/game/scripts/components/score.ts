import { _decorator, Label } from "cc";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("Score")
export class Score extends ObserverComponent {
    @property(Label)
    private home: Label = null;

    @property(Label)
    private away: Label = null;

    onLoad() {
        super.onLoad();
        this.home.string = "0";
        this.away.string = "0";
    }

    @render(VideoStreamStore, (store) => store.homeScore)
    setHome(home: number) {
        this.home.string = home.toString();
    }

    @render(VideoStreamStore, (store) => store.awayScore)
    setAway(away: number) {
        this.away.string = away.toString();
    }
}

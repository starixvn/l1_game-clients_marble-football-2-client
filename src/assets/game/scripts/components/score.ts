import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("Score")
export class Score extends ObserverComponent {
    @property(Label)
    protected home: Label = null;

    @property(Label)
    protected away: Label = null;

    onLoad() {
        this.setHome(0);
        this.setAway(0);
        super.onLoad();
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

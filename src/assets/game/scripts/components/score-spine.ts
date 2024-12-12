import { _decorator, Label, sp } from "cc";
import Observer from "observer";
import { Score } from "./score";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("ScoreSpine")
export class ScoreSpine extends Score {
    @property({ type: Label, visible: false, override: true })
    protected home: Label = null;

    @property({ type: Label, visible: false, override: true })
    protected away: Label = null;

    @property(sp.Skeleton)
    protected homeSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    protected awaySpine: sp.Skeleton = null;

    setHome(home: number) {
        this.homeSpine.setAnimation(0, `score ${home}`, false);
    }

    setAway(away: number) {
        this.awaySpine.setAnimation(0, `score ${away}`, false);
    }
}

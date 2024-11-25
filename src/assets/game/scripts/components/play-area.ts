import gc from "@sg/game-client-base";
import { Node, Vec3, _decorator, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { settings } from "../game-settings";

const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render } = Observer;

type TweenKey = "betChoices" | "scale";

interface ZoomConfig {
    scale?: Vec3;
    position?: Vec3;
    opacity?: number;

    time: number;
}

interface ZoomConfigs {
    in: ZoomConfig;
    out: ZoomConfig;
}

@ccclass("PlayArea")
export class PlayArea extends ObserverComponent {
    private isZoomOut: boolean = false;
    private tweenTargets: Array<{ target: Node; key: TweenKey }>;

    @property(Node)
    private chipContainer: Node = null;

    @property(Node)
    private betChoices: Node = null;

    @property(Node)
    private scoreBoard: Node = null;

    @property(Node)
    private chips: Node = null;

    @property(Node)
    private aroundPlayers: Node = null;

    @property(Node)
    private hiddenPlayers: Node = null;

    @property(Node)
    private rebet: Node = null;

    private readonly zoomConfigs: Record<string, ZoomConfigs> = {
        betChoices: {
            in: { scale: v3(1, 1, 1), position: v3(-1, -86, 0), time: 1 },
            out: { scale: v3(0.5, 0.5, 1), position: v3(-1, -320, 0), time: 1.5 },
        },
        scale: {
            in: { scale: v3(1, 1, 1), time: 1 },
            out: { scale: v3(0, 0, 1), time: 1.5 },
        },
    };

    onLoad() {
        this.tweenTargets = [
            { target: this.betChoices, key: "betChoices" },
            { target: this.chipContainer, key: "betChoices" },
            { target: this.scoreBoard, key: "scale" },
            { target: this.chips, key: "scale" },
            { target: this.aroundPlayers, key: "scale" },
            { target: this.hiddenPlayers, key: "scale" },
            { target: this.rebet, key: "scale" },
        ];

        super.onLoad();
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartWaiting)
    async setAnimZoomInPlayArea(isStartRound: boolean) {
        if (isStartRound && this.isZoomOut) {
            this.zoomPlayArea("in");
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.countdownTimer)
    async setAnimZoomOutPlayArea(time: number) {
        if (!this.isZoomOut && time <= settings.durations.streamingVideo && time > 0) {
            console.log("time: ", time);
            this.zoomPlayArea("out");
        }
    }

    private createZoomTween(node: Node, config: ZoomConfig): Promise<void> {
        return new Promise((resolve) => {
            tween(node).to(config.time, { scale: config.scale, position: config.position }, { easing: "sineInOut" }).call(resolve).start();
        });
    }

    async zoomPlayArea(direction: "in" | "out"): Promise<void> {
        console.log("zoomPlayArea", direction);
        this.isZoomOut = direction === "out";

        await Promise.all(this.tweenTargets.map(({ target, key }) => this.createZoomTween(target, this.zoomConfigs[key][direction])));
    }
}

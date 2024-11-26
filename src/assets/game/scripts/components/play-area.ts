import gc from "@sg/game-client-base";
import { Node, Vec3, _decorator, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { settings } from "../game-settings";
import { AnimationUtils } from "db://shared-components/shared/utils";
const { getUiOpacity } = AnimationUtils;

const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render } = Observer;

type TweenKey = "zoomInOut" | "fadeInOut" | "flyDown" | "flyUp";

interface TweenConfig {
    scale?: Vec3;
    position?: Vec3;
    opacity?: number;
    flyDistance?: number;

    time: number;
}

interface TweenConfigs {
    in: TweenConfig;
    out: TweenConfig;
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

    @property([Node])
    private disappearingNodes: Node[] = [];

    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = {
        zoomInOut: {
            in: { scale: v3(1, 1, 1), position: v3(-1, -86, 0), time: 1 },
            out: { scale: v3(0.551, 0.551, 1), position: v3(-1, -312, 0), time: 1.5 },
        },
        fadeInOut: {
            in: { opacity: 255, time: 1 },
            out: { opacity: 0, time: 1 },
        },
        flyDown: {
            in: { flyDistance: 100, opacity: 255, time: 1 },
            out: { flyDistance: -100, opacity: 0, time: 1 },
        },
        flyUp: {
            in: { flyDistance: -500, opacity: 255, time: 1 },
            out: { flyDistance: 500, opacity: 0, time: 1 },
        },
    };

    onLoad() {
        this.tweenTargets = [
            { target: this.betChoices, key: "zoomInOut" },
            { target: this.chipContainer, key: "zoomInOut" },
            { target: this.scoreBoard, key: "flyUp" },
            { target: this.chips, key: "flyDown" },
        ];

        this.disappearingNodes.forEach((node) => {
            this.tweenTargets.push({ target: node, key: "fadeInOut" });
        });

        super.onLoad();
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setAnimZoomInPlayArea(time: number) {
        if (time <= 0 && this.isZoomOut) {
            this.zoomPlayArea("in");
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setAnimZoomOutPlayArea(time: number) {
        if (!this.isZoomOut && time <= settings.durations.streamingVideo && time > 0) {
            this.zoomPlayArea("out");
        }
    }

    private createTween(node: Node, config: TweenConfig): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(
                    config.time,
                    {
                        scale: config.scale ?? node.scale,
                        position: config.position ?? node.position,
                    },
                    { easing: "sineInOut" }
                )
                .call(resolve)
                .start();

            if (config.opacity !== undefined) {
                const uiOpacity = getUiOpacity(node);
                tween(uiOpacity).to(config.time, { opacity: config.opacity }).call(resolve).start();
            }

            if (config.flyDistance !== undefined) {
                tween(node)
                    .to(config.time, { position: v3(node.position.x, node.position.y + config.flyDistance, node.position.z) })
                    .call(resolve)
                    .start();
            }
        });
    }

    async zoomPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(this.tweenTargets.map(({ target, key }) => this.createTween(target, this.tweenConfigs[key][direction])));
    }
}

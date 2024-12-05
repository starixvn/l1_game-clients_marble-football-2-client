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
    private isScoreBoardOut: boolean = false;
    private isTeamScoreOut: boolean = false;

    private mainPlayAreaTargets: Array<{ target: Node; key: TweenKey }>;

    @property(Node)
    private chipContainer: Node = null;

    @property(Node)
    private betChoices: Node = null;

    @property(Node)
    private scoreBoard: Node = null;

    @property(Node)
    private chips: Node = null;

    @property(Node)
    private teamScore: Node = null;

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
        super.onLoad();

        this.mainPlayAreaTargets = [
            { target: this.betChoices, key: "zoomInOut" },
            { target: this.chipContainer, key: "zoomInOut" },
            { target: this.chips, key: "flyDown" },
        ];

        this.disappearingNodes.forEach((node) => {
            this.mainPlayAreaTargets.push({ target: node, key: "fadeInOut" });
        });
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setAnimAndPositionPlayArea(time: number) {
        if (time < 0) {
            return;
        }

        // At the end of streaming
        if (this.isZoomOut && time === 0) {
            this.zoomPlayArea("in");
        }

        // At the begin of streaming
        if (time === settings.durations.introVideo) {
            this.zoomPlayArea("out");
        }

        // During streaming
        if (!this.isZoomOut && time < settings.durations.introVideo && time > 0) {
            this.setStaticPlayArea("out");
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setTeamScore(time: number) {
        if (time < 0) {
            return;
        }

        // At the begin of streaming
        if (this.isTeamScoreOut && time === settings.durations.streamingVideo + 1) {
            this.playAnimForTarget(this.teamScore, this.tweenConfigs.flyUp.in);
            this.isTeamScoreOut = false;
        }

        // At the end of streaming
        if (!this.isTeamScoreOut && time === 0) {
            this.playAnimForTarget(this.teamScore, this.tweenConfigs.flyUp.out);
            this.isTeamScoreOut = true;
        }

        // Before streaming
        if (!this.isTeamScoreOut && time > settings.durations.streamingVideo + 1) {
            this.setStaticTarget(this.teamScore, this.tweenConfigs.flyUp.out);
            this.isTeamScoreOut = true;
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setScoreBoard(time: number) {
        if (time < 0) {
            return;
        }

        // At the begin of streaming
        if (time === settings.durations.introVideo) {
            this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.flyUp.out);
            this.isScoreBoardOut = true;
        }

        // At the begin of placing bet
        if (this.isScoreBoardOut && time === settings.durations.placingBet) {
            this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.flyUp.in);
            this.isScoreBoardOut = false;
        }

        // before placing bet
        if (!this.isScoreBoardOut && time > settings.durations.placingBet) {
            this.setStaticTarget(this.scoreBoard, this.tweenConfigs.flyUp.out);
            this.isScoreBoardOut = true;
        }

        // during streaming
        if (!this.isScoreBoardOut && time < settings.durations.introVideo) {
            this.setStaticTarget(this.scoreBoard, this.tweenConfigs.flyUp.out);
            this.isScoreBoardOut = true;
        }
    }

    private playAnimForTarget(node: Node, config: TweenConfig): Promise<void> {
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

    private async zoomPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.mainPlayAreaTargets.map(({ target, key }) => this.playAnimForTarget(target, this.tweenConfigs[key][direction]))
        );
    }

    private setStaticTarget(node: Node, config: TweenConfig) {
        node.setPosition(config.position ?? node.position);
        node.setScale(config.scale ?? node.scale);

        if (config.opacity !== undefined) {
            const uiOpacity = getUiOpacity(node);
            uiOpacity.opacity = config.opacity;
        }

        if (config.flyDistance !== undefined) {
            node.setPosition(v3(node.position.x, node.position.y + config.flyDistance, node.position.z));
        }
    }

    private async setStaticPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.mainPlayAreaTargets.map(({ target, key }) => this.setStaticTarget(target, this.tweenConfigs[key][direction]))
        );
    }
}

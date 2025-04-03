import gc from "@sg/game-client-base";
import { Node, Vec3, _decorator, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, GamePhaseConfig, PhaseId, TimePointShowMatchWinner } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";

const { getUiOpacity } = AnimationUtils;
const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render, handle } = Observer;

type TweenKey = "chipContainerZoomInOut" | "fadeInOut" | "chipsFlyDown" | "teamScoreFlyUp" | "betChoiceZoomInOut";

interface TweenConfig {
    scale?: Vec3;
    position?: Vec3;
    opacity?: number;
    positionY?: number;
    time: number;
}

interface TweenConfigs {
    in: TweenConfig;
    out: TweenConfig;
}

@ccclass("PlayArea")
export class PlayArea extends ObserverComponent {
    @property(Node)
    private chipContainerPrev: Node = null;

    @property(Node)
    private chipContainerLive: Node = null;

    @property(Node)
    private chipContainerFinal: Node = null;

    @property(BetChoicesContainer)
    private betChoicesContainer: BetChoicesContainer = null;

    @property(Node)
    private scoreBoard: Node = null;

    @property(Node)
    private chips: Node = null;

    @property(Node)
    private teamScore: Node = null;

    @property([Node])
    private disappearingNodes: Node[] = [];

    private isZoomOut: boolean = false;
    private mainPlayAreaTargetsPrev: Array<{ target: Node; key: TweenKey }>;
    private mainPlayAreaTargetsLive: Array<{ target: Node; key: TweenKey }>;
    private mainPlayAreaTargetsFinal: Array<{ target: Node; key: TweenKey }>;
    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = {
        betChoiceZoomInOut: {
            in: { scale: v3(1, 1, 1), position: v3(0, -94, 0), time: 0.5 },
            out: { scale: v3(1, 1, 1), position: v3(0, -570, 0), time: 1 },
        },
        chipContainerZoomInOut: {
            in: { scale: v3(1, 1, 1), position: v3(0, -86, 0), time: 0.5 },
            out: { scale: v3(1, 1, 1), position: v3(0, -570, 0), time: 1 },
        },
        fadeInOut: {
            in: { opacity: 255, time: 0.5 },
            out: { opacity: 1, time: 1 },
        },
        chipsFlyDown: {
            in: { positionY: -285, opacity: 255, time: 1 },
            out: { positionY: -385, opacity: 0, time: 1 },
        },
        teamScoreFlyUp: {
            in: { positionY: 303, opacity: 255, time: 0.5 },
            out: { positionY: 630, opacity: 0, time: 0.75 },
        },
    };

    private readonly ShowLiveScore = "show-live-score";
    private readonly ShowWinnerAndTournamentTimeOffset = 1;

    protected containerBets: Node = null;
    protected chipContainers: Node[] = [];

    onLoad() {
        this.chipContainers = [this.chipContainerPrev, this.chipContainerLive, this.chipContainerFinal];
        this.containerBets = this.betChoicesContainer.betChoicesPrev.parent;
        const commonTargets = [
            { target: this.containerBets, key: "betChoiceZoomInOut" as TweenKey },
            { target: this.chips, key: "chipsFlyDown" as TweenKey },
        ];

        this.mainPlayAreaTargetsPrev = [...commonTargets, { target: this.chipContainerPrev, key: "chipContainerZoomInOut" }];
        this.mainPlayAreaTargetsLive = [...commonTargets, { target: this.chipContainerLive, key: "chipContainerZoomInOut" }];
        this.mainPlayAreaTargetsFinal = [...commonTargets, { target: this.chipContainerFinal, key: "chipContainerZoomInOut" }];

        this.disappearingNodes.forEach((node) => {
            this.mainPlayAreaTargetsPrev.push({ target: node, key: "fadeInOut" });
            this.mainPlayAreaTargetsLive.push({ target: node, key: "fadeInOut" });
        });

        this.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
        super.onLoad();

        this.registerPhaseMatchWinner();
        this.registerPhaseShowLiveScore();
        this.registerPhaseShowBetChoicesPrev();
        this.registerPhaseShowBetChoicesLive();
        this.registerPhaseShowIntroVideo();
        this.registerPhaseShowLiveVideo();
        this.registerSettlement();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseMatchWinner() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowWinnerAndTournament,
            begin: TimePointShowMatchWinner + this.ShowWinnerAndTournamentTimeOffset,
            end: settings.points.placingBetPreMatch + this.ShowWinnerAndTournamentTimeOffset,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowLiveScore() {
        const config: GamePhaseConfig = {
            id: this.ShowLiveScore,
            begin: settings.points.streamingFirstHalfVideo + 1,
            end: 1,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowBetChoicesPrev() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowBetChoicesPrev,
            begin: settings.points.placingBetPreMatch,
            end: settings.points.placingBetPreMatch - settings.durations.placingBet,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowBetChoicesLive() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowBetChoicesLive,
            begin: settings.points.placingBetLiveMatch,
            end: settings.points.placingBetLiveMatch - settings.durations.placingBet,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowIntroVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowIntroVideo,
            begin: settings.points.introVideo,
            end: settings.points.introVideo - settings.durations.introVideo,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowLiveVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowLiveVideo,
            begin: settings.points.streamingSecondHalfVideo,
            end: settings.points.streamingSecondHalfVideo - settings.durations.videoDuration,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerSettlement() {
        const config: GamePhaseConfig = {
            id: PhaseId.Settlement,
            begin: settings.durations.wholeRound,
            end: settings.durations.wholeRound - settings.durations.startRound,
        };
        return config;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.ShowWinnerAndTournament) {
            if (phase.progress === 0) {
                const duration = 0.2;
                this.scheduleOnce(
                    () => this.fadeOutBetChoiceNode(this.containerBets, true, duration),
                    this.ShowWinnerAndTournamentTimeOffset - duration
                );
            } else {
                this.fadeOutBetChoiceNode(this.containerBets, true, 0);
            }

            return;
        }

        if (phase.id === PhaseId.Settlement) {
            this.betChoicesContainer.setEnableBetChoices("final");
            this.fadeOutBetChoiceNode(this.containerBets, false, 0);
            this.disappearingNodes.forEach((node) => {
                this.setStaticTarget(node, this.tweenConfigs.fadeInOut.in);
            });

            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            this.betChoicesContainer.setFirstHalfDisabled(phase.id === PhaseId.ShowBetChoicesLive);
            if (phase.progress === 0) {
                this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
            } else {
                this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                if (phase.id === PhaseId.ShowBetChoicesPrev) {
                    this.betChoicesContainer.setEnableBetChoices("prev");
                    this.setStaticPlayArea("in", "prev");
                } else {
                    this.betChoicesContainer.setEnableBetChoices("live");
                    this.setStaticPlayArea("in", "live");
                }
            }

            if (this.isZoomOut) {
                this.zoomPlayArea("in", phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
            }

            return;
        }

        if (phase.id === PhaseId.ShowIntroVideo || phase.id === PhaseId.ShowLiveVideo) {
            if (phase.progress === 0) {
                this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
            } else {
                this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
            }

            if (!this.isZoomOut) {
                this.zoomPlayArea("out", phase.id === PhaseId.ShowIntroVideo ? "prev" : "live");
            }

            return;
        }

        if (phase.id === this.ShowLiveScore) {
            if (phase.progress === 0) {
                this.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in);
            } else {
                this.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in);
            }

            return;
        }
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.Tournament) {
            const duration = 0.2;
            this.scheduleOnce(() => {
                this.betChoicesContainer.setEnableBetChoices("prev");
                this.fadeOutBetChoiceNode(this.containerBets, false, duration);
            }, this.ShowWinnerAndTournamentTimeOffset - duration);
            return;
        }

        if (phase.id === PhaseId.Halftime) {
            const duration = 0.2;
            this.scheduleOnce(() => {
                this.betChoicesContainer.setEnableBetChoices("live");
                this.fadeOutBetChoiceNode(this.containerBets, false, duration);
            }, this.ShowWinnerAndTournamentTimeOffset - duration);
            return;
        }
    }

    fadeOutBetChoiceNode(node: Node, fadeOut: boolean, duration: number) {
        const opacity = fadeOut ? 1 : 255;

        if (duration === 0) {
            AnimationUtils.setOpacityNode(node, opacity);
            node.active = !fadeOut;
            return;
        }

        fadeOut ? AnimationUtils.fadeOutAndDeactivate(node, duration) : AnimationUtils.fadeInAndActivate(node, duration);
    }

    @render(gc.Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    async showPlayArea(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        try {
            await AnimationUtils.delayTime(settings.durations.outro);
            if (this.isZoomOut) {
                this.zoomPlayArea("in", "final");
            }
            this.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        } catch (e) {}
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
                .call(() => resolve())
                .start();

            if (config.opacity !== undefined) {
                const uiOpacity = getUiOpacity(node);
                tween(uiOpacity)
                    .to(config.time, { opacity: config.opacity })
                    .call(() => resolve())
                    .start();
            }

            if (config.positionY !== undefined) {
                tween(node)
                    .to(config.time, { position: v3(node.position.x, config.positionY, node.position.z) })
                    .call(() => resolve())
                    .start();
            }
        });
    }

    private async zoomPlayArea(direction: "in" | "out", state: "prev" | "live" | "final"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.getMainPlayAreaTargets(state).map(({ target, key }) => this.playAnimForTarget(target, this.tweenConfigs[key][direction]))
        );
    }

    private setStaticTarget(node: Node, config: TweenConfig) {
        node.setPosition(config.position ?? node.position);
        node.setScale(config.scale ?? node.scale);

        if (config.opacity !== undefined) {
            const uiOpacity = getUiOpacity(node);
            uiOpacity.opacity = config.opacity;
        }

        if (config.positionY !== undefined) {
            node.setPosition(v3(node.position.x, config.positionY, node.position.z));
        }
    }

    private async setStaticPlayArea(direction: "in" | "out", state: "prev" | "live" | "final"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.getMainPlayAreaTargets(state)?.map(({ target, key }) => this.setStaticTarget(target, this.tweenConfigs[key][direction]))
        );
    }

    private getMainPlayAreaTargets(state: "prev" | "live" | "final"): Array<{ target: Node; key: TweenKey }> {
        switch (state) {
            case "prev":
                return this.mainPlayAreaTargetsPrev;
            case "live":
                return this.mainPlayAreaTargetsLive;
            case "final":
                return this.mainPlayAreaTargetsFinal;
            default:
                return this.mainPlayAreaTargetsPrev;
        }
    }
}

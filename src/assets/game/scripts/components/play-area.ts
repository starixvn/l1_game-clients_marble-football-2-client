import gc from "@sg/game-client-base";
import { Button, Node, Vec3, _decorator, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, GamePhaseConfig, PhaseId, TimePointShowMatchWinner } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";
import { StatusBetsButton } from "./bet-options/status-bets-button";
import { ButtonsBetHandler } from "../features/buttons/buttons-bet-handler";
import { ButtonsBetStore } from "../features/buttons/buttons-bet-store";

const { getUiOpacity } = AnimationUtils;
const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render, handle } = Observer;

type TweenKey = "chipContainerZoomInOut" | "fadeInOut" | "chipsFlyDown" | "teamScoreFlyUp" | "betChoiceZoomInOut";
type BetState = "prev" | "live" | "final";

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

    @property(StatusBetsButton)
    previewBetsButton: StatusBetsButton = null;

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
            in: { scale: v3(1, 1, 1), position: v3(0, 0, 0), time: 0.5 },
            out: { scale: v3(1, 1, 1), position: v3(0, -410, 0), time: 1 },
        },
        fadeInOut: {
            in: { opacity: 255, time: 0.5 },
            out: { opacity: 1, time: 1 },
        },
        chipsFlyDown: {
            in: { positionY: -327, opacity: 255, time: 1 },
            out: { positionY: -445, opacity: 0, time: 1 },
        },
        teamScoreFlyUp: {
            in: { positionY: 303, opacity: 255, time: 0.5 },
            out: { positionY: 630, opacity: 0, time: 0.75 },
        },
    };

    private readonly ShowLiveScore = "show-live-score";
    private readonly ShowWinnerAndTournamentTimeOffset = 1;
    private isPreviewBets: boolean = false;
    private phasePreviewBets: BetState = "prev";

    protected containerBets: Node = null;
    protected chipContainers: Node[] = [];
    protected durationShowBetChoices = 0.5;

    onLoad() {
        this.initializeContainers();
        this.setupMainPlayAreaTargets();
        this.setupDisappearingNodes();
        this.setupStaticTargets();
        super.onLoad();
        this.registerAllPhases();
        this.previewBetsButton.node.on(Button.EventType.CLICK, this.showHideBets, this);
    }

    private initializeContainers() {
        this.chipContainers = [this.chipContainerPrev, this.chipContainerLive, this.chipContainerFinal];
        this.containerBets = this.betChoicesContainer.betChoicesPrev.parent;
    }

    private setupMainPlayAreaTargets() {
        const commonTargets = [
            { target: this.containerBets, key: "betChoiceZoomInOut" as TweenKey },
            { target: this.chips, key: "chipsFlyDown" as TweenKey },
        ];

        this.mainPlayAreaTargetsPrev = [...commonTargets, { target: this.chipContainerPrev, key: "chipContainerZoomInOut" }];
        this.mainPlayAreaTargetsLive = [...commonTargets, { target: this.chipContainerLive, key: "chipContainerZoomInOut" }];
        this.mainPlayAreaTargetsFinal = [...commonTargets, { target: this.chipContainerFinal, key: "chipContainerZoomInOut" }];
    }

    private setupDisappearingNodes() {
        this.disappearingNodes.forEach((node) => {
            this.mainPlayAreaTargetsPrev.push({ target: node, key: "fadeInOut" });
            this.mainPlayAreaTargetsLive.push({ target: node, key: "fadeInOut" });
            this.mainPlayAreaTargetsFinal.push({ target: node, key: "fadeInOut" });
        });
    }

    private setupStaticTargets() {
        this.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
        this.setStaticTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
        this.disappearingNodes.forEach((node) => {
            this.setStaticTarget(node, this.tweenConfigs.fadeInOut.out);
        });
    }

    private registerAllPhases() {
        this.registerPhaseMatchWinner();
        this.registerPhaseShowLiveScore();
        this.registerPhaseShowBetChoicesPrev();
        this.registerPhaseShowBetChoicesLive();
        this.registerPhaseShowIntroVideo();
        this.registerPhaseShowPrevVideo();
        this.registerPhaseShowLiveVideo();
        this.registerSettlement();
        this.registerPhaseHideBetChoicesPrev();
        this.registerPhaseHideBetChoicesLive();
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
    registerPhaseShowPrevVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowPrevVideo,
            begin: settings.points.streamingFirstHalfVideo,
            end: settings.points.streamingFirstHalfVideo - settings.durations.videoDuration,
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

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseHideBetChoicesLive() {
        const config: GamePhaseConfig = {
            id: PhaseId.HidePreviewBetChoicesLive,
            begin: settings.points.streamingSecondHalfVideo - settings.durations.hidePreviewBetChoices,
            end: settings.points.streamingSecondHalfVideo - settings.durations.videoDuration,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseHideBetChoicesPrev() {
        const config: GamePhaseConfig = {
            id: PhaseId.HidePreviewBetChoicesPrev,
            begin: settings.points.streamingFirstHalfVideo - settings.durations.hidePreviewBetChoices,
            end: settings.points.streamingFirstHalfVideo - settings.durations.videoDuration,
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

            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            if (phase.progress === 0) {
                this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                this.scheduleBetChoiceFadeIn(phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
            } else {
                this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                this.betChoicesContainer.setEnableBetChoices(phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
                this.fadeOutBetChoiceNode(this.containerBets, false, 0);
                this.setStaticPlayArea("in", phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
                this.disappearingNodes.forEach((node) => {
                    this.setStaticTarget(node, this.tweenConfigs.fadeInOut.in);
                });
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

            if (phase.id === PhaseId.ShowIntroVideo) {
                this.phasePreviewBets = "prev";
            } else {
                this.phasePreviewBets = "live";
            }

            return;
        }

        if (phase.id === PhaseId.HidePreviewBetChoicesLive || phase.id === PhaseId.HidePreviewBetChoicesPrev) {
            this.betChoicesContainer.setDisableBetChoices();
            this.fadeOutBetChoiceNode(this.containerBets, true, this.durationShowBetChoices);
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

    private scheduleBetChoiceFadeIn(action: BetState) {
        this.scheduleOnce(() => {
            this.betChoicesContainer.setEnableBetChoices(action);
            this.fadeOutBetChoiceNode(this.containerBets, false, this.durationShowBetChoices);
        }, this.durationShowBetChoices);
    }

    private scheduleBetChoiceFadeOut() {
        this.scheduleOnce(() => {
            this.betChoicesContainer.setDisableBetChoices();
            this.fadeOutBetChoiceNode(this.containerBets, true, this.durationShowBetChoices);
        }, this.durationShowBetChoices);
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        const phaseActions: Partial<Record<PhaseId, BetState>> = {
            [PhaseId.Tournament]: "prev",
            [PhaseId.Halftime]: "live",
        };

        if (phase.id in phaseActions) {
            this.scheduleBetChoiceFadeIn(phaseActions[phase.id]);
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
        }
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.setPreviewBets(!this.isPreviewBets);
    }

    @handle(ButtonsBetHandler, (handle, isPreviewBets: boolean) => handle.handlePreviewBets(isPreviewBets))
    private setPreviewBets(isPreviewBets: boolean) {
        return isPreviewBets;
    }

    private getCurrentChipContainer(): Node {
        return this.phasePreviewBets === "prev" ? this.chipContainerPrev : this.chipContainerLive;
    }

    private async animateBetElements(direction: "in" | "out", showBets: boolean) {
        const chipContainer = this.getCurrentChipContainer();
        const betState = this.phasePreviewBets === "prev" ? "prev" : "live";

        if (showBets) {
            this.scheduleBetChoiceFadeIn(betState);
        } else {
            this.scheduleBetChoiceFadeOut();
        }

        await Promise.all([
            this.playAnimForTarget(this.containerBets, this.tweenConfigs.betChoiceZoomInOut[direction]),
            this.playAnimForTarget(chipContainer, this.tweenConfigs.chipContainerZoomInOut[direction]),
        ]);
    }

    @render(ButtonsBetStore, (store) => store.isPreviewBets, { fireImmediately: false })
    async renderButtonsBet(isPreviewBets: boolean) {
        this.previewBetsButton.setVisibilityState(isPreviewBets);
        this.isPreviewBets = isPreviewBets;
        await this.animateBetElements(isPreviewBets ? "in" : "out", isPreviewBets);
    }
}

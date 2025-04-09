import gc from "@sg/game-client-base";
import { Button, Node, _decorator, log, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";
import { StatusBetsButton } from "./bet-options/status-bets-button";
import { ButtonsBetStore } from "../features/preview-bets/buttons-bet-store";
import { PreviewBetsHandler } from "../features/preview-bets/preview-bets-handler";
import { AnimationHelper, TweenConfig, TweenConfigs } from "./helpers/animation-helper";
import { PhasesRegistry } from "./helpers/phases-registry";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

type TweenKey =
    | "chipContainerZoomInOut"
    | "fadeInOut"
    | "chipsFlyDown"
    | "teamScoreFlyUp"
    | "betChoiceZoomInOut"
    | "betChoicePreviewZoomInOut"
    | "chipContainerPreviewZoomInOut";
type BetState = "prev" | "live" | "final";

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

    @property(Node)
    private firstHalfScore: Node = null;

    @property(Node)
    private mainPlayerNode: Node = null;

    @property([Node])
    private disappearingNodes: Node[] = [];

    @property(StatusBetsButton)
    previewBetsButton: StatusBetsButton = null;

    private isSwapBets: boolean = false;
    private isZoomOut: boolean = false;
    private mainPlayAreaTargetsPrev: Array<{ target: Node; key: TweenKey }>;
    private mainPlayAreaTargetsLive: Array<{ target: Node; key: TweenKey }>;
    private mainPlayAreaTargetsFinal: Array<{ target: Node; key: TweenKey }>;
    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = {
        betChoiceZoomInOut: {
            in: { position: v3(0, -94, 0), time: 0.2 },
            out: { position: v3(0, -570, 0), time: 1 },
        },
        betChoicePreviewZoomInOut: {
            in: { position: v3(0, -183, 0), time: 0 },
            out: { position: v3(0, -570, 0), time: 0 },
        },
        chipContainerPreviewZoomInOut: {
            in: { position: v3(0, -89, 0), time: 0 },
            out: { position: v3(0, -410, 0), time: 0 },
        },
        chipContainerZoomInOut: {
            in: { position: v3(0, 0, 0), time: 0.2 },
            out: { position: v3(0, -410, 0), time: 0.5 },
        },
        fadeInOut: {
            in: { opacity: 255, time: 0.5 },
            out: { opacity: 1, time: 1 },
        },
        chipsFlyDown: {
            in: { positionY: -327, opacity: 255, time: 0.2 },
            out: { positionY: -445, opacity: 0, time: 0.5 },
        },
        teamScoreFlyUp: {
            in: { positionY: 303, opacity: 255, time: 0.5 },
            out: { positionY: 630, opacity: 0, time: 0.75 },
        },
    };

    private isPreviewBets: boolean = false;
    private phasePreviewBets: BetState = "prev";
    private phaseShowBetChoices: BetState = "prev";

    protected betChoicesParentContainer: Node = null;
    protected chipContainers: Node[] = [];
    protected readonly durationShowBetChoices = 0.5;

    onLoad() {
        this.initializeContainers();
        this.setupMainPlayAreaTargets();
        this.setupDisappearingNodes();
        this.setupStaticTargets();
        super.onLoad();
        this.previewBetsButton.node.on(Button.EventType.CLICK, this.showHideBets, this);
        this.betChoicesContainer.swapBetsButton.on(Button.EventType.CLICK, this.swapBets, this);
    }

    private initializeContainers() {
        this.chipContainers = [this.chipContainerPrev, this.chipContainerLive, this.chipContainerFinal];
        this.betChoicesParentContainer = this.betChoicesContainer.betChoicesPrev?.parent;
    }

    private setupMainPlayAreaTargets() {
        const commonTargets = [
            { target: this.betChoicesParentContainer, key: "betChoiceZoomInOut" as TweenKey },
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
        AnimationHelper.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        AnimationHelper.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
        AnimationHelper.setStaticTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
        AnimationHelper.setStaticTarget(this.firstHalfScore, this.tweenConfigs.fadeInOut.out);
        this.disappearingNodes.forEach((node) => {
            AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.out);
        });
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        log("renderEnterPhase: ", phase.id);
        this.isSwapBets = false;

        if (phase.id === PhaseId.ShowWinnerAndTournament) {
            if (phase.progress === 0) {
                const duration = 0.2;
                this.scheduleOnce(() => this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, duration), 0.8);
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.playAnimForTarget(node, this.tweenConfigs.fadeInOut.out);
                });
                AnimationHelper.playAnimForTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
            } else {
                this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, 0);
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.out);
                });
                AnimationHelper.setStaticTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
            }

            return;
        }

        if (phase.id === PhaseId.Settlement) {
            this.betChoicesContainer.setEnableBetChoices("final");
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, 0);
            AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
            this.disappearingNodes.forEach((node) => {
                AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.in);
            });

            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            this.phaseShowBetChoices = phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live";

            if (phase.progress === 0) {
                AnimationHelper.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                this.scheduleBetChoiceFadeIn(phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
                AnimationHelper.playAnimForTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.playAnimForTarget(node, this.tweenConfigs.fadeInOut.in);
                });
                AnimationHelper.playAnimForTarget(this.chips, this.tweenConfigs.chipsFlyDown.in);
            } else {
                AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
                AnimationHelper.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                this.betChoicesContainer.setEnableBetChoices(phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live", this.isSwapBets);
                this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, 0);
                this.setStaticPlayArea("in", phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
            }

            if (this.isZoomOut) {
                this.zoomPlayArea("in", phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
            }

            if (phase.id === PhaseId.ShowBetChoicesLive) {
                this.playAnimByPhaseProgress(
                    [this.firstHalfScore, this.teamScore],
                    [this.tweenConfigs.fadeInOut.in, this.tweenConfigs.teamScoreFlyUp.out],
                    phase.progress
                );
            }

            return;
        }

        if (phase.id === PhaseId.ShowIntroVideo || phase.id === PhaseId.ShowLiveVideo) {
            this.playAnimByPhaseProgress(
                [this.scoreBoard, this.mainPlayerNode],
                [this.tweenConfigs.fadeInOut.out, this.tweenConfigs.fadeInOut.out],

                phase.progress
            );

            if (!this.isZoomOut) {
                this.zoomPlayArea("out", phase.id === PhaseId.ShowIntroVideo ? "prev" : "live");
            }

            if (phase.id === PhaseId.ShowIntroVideo) {
                this.phasePreviewBets = "prev";
            } else {
                this.phasePreviewBets = "live";
                this.playAnimByPhaseProgress(this.firstHalfScore, this.tweenConfigs.fadeInOut.out, phase.progress);
            }

            if (phase.id === PhaseId.ShowLiveVideo) {
                this.playAnimByPhaseProgress(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in, phase.progress);
            }

            return;
        }

        if (phase.id === PhaseId.AutoHidePreviewBetChoicesLive || phase.id === PhaseId.AutoHidePreviewBetChoicesPrev) {
            this.setPreviewBets(false);
            this.betChoicesContainer.setDisableBetChoices();
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, this.durationShowBetChoices);
            this.chipContainers.forEach((chipContainer) => {
                AnimationHelper.setStaticTarget(chipContainer, this.tweenConfigs.chipContainerZoomInOut.out);
            });

            if (phase.id === PhaseId.AutoHidePreviewBetChoicesLive) {
                this.playAnimByPhaseProgress(this.firstHalfScore, this.tweenConfigs.fadeInOut.out, phase.progress);

                return;
            }
        }

        if (phase.id === PhaseId.ShowPrevVideo) {
            this.playAnimByPhaseProgress(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in, phase.progress);
        }
    }

    private async playAnimByPhaseProgress(nodes: Node | Node[], config: TweenConfig | TweenConfig[], phaseProgress: number) {
        const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
        const configArray = Array.isArray(config) ? config : [config];

        const finalConfigs = nodeArray.map((_, index) => configArray[index] || configArray[0]);

        switch (phaseProgress) {
            case 0:
                await Promise.all(nodeArray.map((node, index) => AnimationHelper.playAnimForTarget(node, finalConfigs[index])));
                break;
            default:
                nodeArray.forEach((node, index) => {
                    AnimationHelper.setStaticTarget(node, finalConfigs[index]);
                });
        }
    }

    private teamScoreFlyIn(phaseProgress: number) {
        this.playAnimByPhaseProgress(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in, phaseProgress);
    }

    private scheduleBetChoiceFadeIn(action: BetState, duration?: number) {
        this.scheduleOnce(() => {
            this.betChoicesContainer.setEnableBetChoices(action, this.isSwapBets);
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, duration ?? this.durationShowBetChoices);
        }, duration ?? this.durationShowBetChoices);
    }

    private scheduleBetChoiceFadeOut(duration?: number) {
        this.scheduleOnce(() => {
            this.betChoicesContainer.setDisableBetChoices();
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, duration ?? this.durationShowBetChoices);
        }, duration ?? this.durationShowBetChoices);
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
            return;
        }

        fadeOut ? AnimationUtils.fadeOut(node, duration) : AnimationUtils.fadeIn(node, duration);
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
            AnimationHelper.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        } catch (e) {}
    }

    private async zoomPlayArea(direction: "in" | "out", state: "prev" | "live" | "final"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.getMainPlayAreaTargets(state).map(({ target, key }) =>
                AnimationHelper.playAnimForTarget(target, this.tweenConfigs[key][direction])
            )
        );
    }

    private async setStaticPlayArea(direction: "in" | "out", state: "prev" | "live" | "final"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.getMainPlayAreaTargets(state)?.map(({ target, key }) =>
                AnimationHelper.setStaticTarget(target, this.tweenConfigs[key][direction])
            )
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
        this.isSwapBets = false;
        this.setPreviewBets(!this.isPreviewBets);
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private swapBets() {
        this.isSwapBets = !this.isSwapBets;
        if (this.phaseShowBetChoices === "live" || this.phasePreviewBets === "live") {
            this.betChoicesContainer.setEnableBetChoices("live", this.isSwapBets);

            this.chipContainerPrev.active = this.isSwapBets;
            this.chipContainerLive.active = !this.isSwapBets;
        }
    }

    @handle(PreviewBetsHandler, (handle, isPreviewBets: boolean) => handle.handlePreviewBets(isPreviewBets))
    private setPreviewBets(isPreviewBets: boolean) {
        return isPreviewBets;
    }

    private getCurrentChipContainer(): Node {
        if (this.phasePreviewBets === "live" && !this.isSwapBets) {
            return this.chipContainerLive;
        }

        return this.chipContainerPrev;
    }

    private async animateBetElements() {
        const direction = this.isPreviewBets ? "in" : "out";
        const chipContainer = this.getCurrentChipContainer();
        const betState = this.phasePreviewBets === "prev" ? "prev" : "live";

        if (this.isPreviewBets) {
            this.scheduleBetChoiceFadeIn(betState, 0);
        } else {
            this.scheduleBetChoiceFadeOut(0);
        }

        this.chipContainerPrev.active = this.isPreviewBets && (betState === "prev" || (betState === "live" && this.isSwapBets));
        this.chipContainerLive.active = this.isPreviewBets && betState === "live" && !this.isSwapBets;

        await Promise.all([
            AnimationHelper.playAnimForTarget(this.betChoicesParentContainer, this.tweenConfigs.betChoicePreviewZoomInOut[direction]),
            AnimationHelper.playAnimForTarget(chipContainer, this.tweenConfigs.chipContainerPreviewZoomInOut[direction]),
        ]);
    }

    @render(ButtonsBetStore, (store) => store.isPreviewBets, { fireImmediately: false })
    async renderButtonsBet(isPreviewBets: boolean) {
        this.previewBetsButton.setVisibilityState(isPreviewBets);
        this.isPreviewBets = isPreviewBets;
        this.animateBetElements();
    }
}

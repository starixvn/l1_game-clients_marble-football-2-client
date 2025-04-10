import gc from "@sg/game-client-base";
import { Button, Node, _decorator, log, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";
import { ButtonsBetStore } from "../features/preview-bets/buttons-bet-store";
import { AnimationHelper, TweenConfig, TweenConfigs } from "./helpers/animation-helper";

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
    private chipContainersParent: Node = null;

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

    private isZoomOut: boolean = false;
    private mainPlayAreaTargets: Array<{ target: Node; key: TweenKey }>;

    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = {
        betChoiceZoomInOut: {
            in: { position: v3(0, -94, 0), time: 0.2 },
            out: { position: v3(0, -570, 0), time: 1 },
        },
        betChoicePreviewZoomInOut: {
            in: { position: v3(0, -94, 0), time: 0 },
            out: { position: v3(0, -570, 0), time: 0 },
        },
        chipContainerPreviewZoomInOut: {
            in: { position: v3(0, 0, 0), time: 0 },
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
            in: { positionY: -306, opacity: 255, time: 0.2 },
            out: { positionY: -445, opacity: 0, time: 0.5 },
        },
        teamScoreFlyUp: {
            in: { positionY: 303, opacity: 255, time: 0.5 },
            out: { positionY: 630, opacity: 0, time: 0.75 },
        },
    };

    private phasePreviewBets: BetState = "prev";
    protected readonly durationShowBetChoices = 0.5;

    protected betChoicesParentContainer: Node = null;

    onLoad() {
        this.initializeContainers();
        this.setupMainPlayAreaTargets();
        this.setupDisappearingNodes();
        this.setupStaticTargets();
        super.onLoad();

        if (this.betChoicesContainer) {
            this.betChoicesContainer.init(this.handlePhaseChange.bind(this));
        }

        this.betChoicesContainer.swapBetsButton.on(Button.EventType.CLICK, this.swapBets, this);
    }

    private initializeContainers() {
        this.betChoicesParentContainer = this.betChoicesContainer?.betChoicesPrev?.parent;
    }

    private setupMainPlayAreaTargets() {
        const commonTargets = [
            { target: this.betChoicesParentContainer, key: "betChoiceZoomInOut" as TweenKey },
            { target: this.chips, key: "chipsFlyDown" as TweenKey },
            { target: this.chipContainersParent, key: "chipContainerZoomInOut" as TweenKey },
        ];

        this.mainPlayAreaTargets = [...commonTargets];
    }

    private setupDisappearingNodes() {
        this.disappearingNodes.forEach((node) => {
            this.mainPlayAreaTargets.push({ target: node, key: "fadeInOut" });
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

    private handlePhaseChange(phaseId: PhaseId, action: BetState) {
        if (phaseId === PhaseId.ShowBetChoicesLive) {
            this.playAnimByPhaseProgress(
                [this.firstHalfScore, this.teamScore],
                [this.tweenConfigs.fadeInOut.in, this.tweenConfigs.teamScoreFlyUp.out],
                0 // Assume progress is 0 for animation
            );
        }

        if (this.isZoomOut) {
            this.zoomPlayArea("in", action);
        }
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        log("renderEnterPhase: ", phase.id);
        this.chipContainersParent.active = true;

        if (phase.id === PhaseId.ShowWinnerAndTournament) {
            if (phase.progress === 0) {
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.playAnimForTarget(node, this.tweenConfigs.fadeInOut.out);
                });
                AnimationHelper.playAnimForTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
            } else {
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.out);
                });
                AnimationHelper.setStaticTarget(this.chips, this.tweenConfigs.chipsFlyDown.out);
            }
            return;
        }

        if (phase.id === PhaseId.Settlement) {
            AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
            this.disappearingNodes.forEach((node) => {
                AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.in);
            });
            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            if (phase.progress === 0) {
                AnimationHelper.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                AnimationHelper.playAnimForTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
                this.disappearingNodes.forEach((node) => {
                    AnimationHelper.playAnimForTarget(node, this.tweenConfigs.fadeInOut.in);
                });
                AnimationHelper.playAnimForTarget(this.chips, this.tweenConfigs.chipsFlyDown.in);
            } else {
                AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
                AnimationHelper.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
                this.setStaticPlayArea("in", phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live");
            }
            return;
        }

        if (phase.id === PhaseId.ShowIntroVideo || phase.id === PhaseId.ShowPrevVideo || phase.id === PhaseId.ShowLiveVideo) {
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
            this.chipContainersParent.active = false;

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
        return this.mainPlayAreaTargets;
    }

    private async animateBetElements(isPreviewBets: boolean) {
        const direction = isPreviewBets ? "in" : "out";
        const betState = this.phasePreviewBets === "prev" ? "prev" : "live";
        const isSwapBets = this.betChoicesContainer.getIsSwapBets();

        if (isPreviewBets) {
            this.betChoicesContainer.scheduleBetChoiceFadeIn(betState, 0);
        } else {
            this.betChoicesContainer.scheduleBetChoiceFadeOut(0);
        }

        this.chipContainerPrev.active = isPreviewBets && (betState === "prev" || (betState === "live" && isSwapBets));
        this.chipContainerLive.active = isPreviewBets && betState === "live" && !isSwapBets;

        await Promise.all([
            AnimationHelper.playAnimForTarget(this.betChoicesParentContainer, this.tweenConfigs.betChoicePreviewZoomInOut[direction]),
            AnimationHelper.playAnimForTarget(this.chipContainersParent, this.tweenConfigs.chipContainerPreviewZoomInOut[direction]),
        ]);
    }

    @render(ButtonsBetStore, (store) => store.isPreviewBets, { fireImmediately: false })
    async renderButtonsBet(isPreviewBets: boolean) {
        this.betChoicesContainer.statusBetsButton.setVisibilityState(isPreviewBets);
        this.animateBetElements(isPreviewBets);
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    swapBets() {
        const isSwapBets = this.betChoicesContainer.getIsSwapBets();
        const betChoicesPrev = this.betChoicesContainer.betChoicesPrev;
        const betChoicesLive = this.betChoicesContainer.betChoicesLive;

        if (isSwapBets && betChoicesPrev.active) {
            this.chipContainerPrev.active = false;
            betChoicesPrev.active = false;

            this.chipContainerLive.active = true;
            betChoicesLive.active = true;

            this.betChoicesContainer.setIsSwapBets(false);
            return;
        }

        if (!isSwapBets && betChoicesLive.active) {
            this.chipContainerPrev.active = true;
            betChoicesPrev.active = true;

            this.chipContainerLive.active = false;
            betChoicesLive.active = false;

            this.betChoicesContainer.setIsSwapBets(true);
            return;
        }
    }
}

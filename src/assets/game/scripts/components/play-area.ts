import gc from "@sg/game-client-base";
import { Button, Node, _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";
import { ButtonsBetStore } from "../features/preview-bets/buttons-bet-store";
import { AnimationHelper } from "./helpers/animation-helper";
import { TweenConfigs, TweenKey, DEFAULT_TWEEN_CONFIGS } from "./helpers/tween-configs";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

type BetState = "prev" | "live" | "final";

@ccclass("PlayArea")
export class PlayArea extends ObserverComponent {
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

    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = DEFAULT_TWEEN_CONFIGS;

    private phasePreviewBets: BetState = "prev";
    private phaseShowBetChoices: BetState = "prev";

    protected betChoicesParentContainer: Node = null;

    onLoad() {
        this.initBetChoicesContainer();
        this.setupMainPlayAreaTargets();
        this.setupDisappearingNodes();
        this.setupStaticTargets();
        super.onLoad();

        this.betChoicesContainer.swapBetsButton.on(Button.EventType.CLICK, this.swapBets, this);
    }

    private initBetChoicesContainer() {
        this.betChoicesParentContainer = this.betChoicesContainer?.betChoicesPrev?.parent;
    }

    private setupMainPlayAreaTargets() {
        this.mainPlayAreaTargets = [
            { target: this.betChoicesParentContainer, key: "betChoiceZoomInOut" as TweenKey },
            { target: this.chips, key: "chipsFlyDown" as TweenKey },
            { target: this.chipContainersParent, key: "chipContainerFlyDown" as TweenKey },
        ];
    }

    private setupDisappearingNodes() {
        this.disappearingNodes.forEach((node) => {
            node && this.mainPlayAreaTargets.push({ target: node, key: "fadeInOut" });
        });
    }

    private setupStaticTargets() {
        const staticTargets = [
            { node: this.teamScore, config: this.tweenConfigs.teamScoreFlyUp.out },
            { node: this.scoreBoard, config: this.tweenConfigs.scoreboardFlyUp.out },
            { node: this.chips, config: this.tweenConfigs.chipsFlyDown.out },
            { node: this.firstHalfScore, config: this.tweenConfigs.teamScoreLiveFlyUp.out },
            { node: this.mainPlayerNode, config: this.tweenConfigs.fadeInOut.out },
        ];

        staticTargets.forEach(({ node, config }) => {
            AnimationHelper.setStaticTarget(node, config);
        });

        this.disappearingNodes.forEach((node) => {
            AnimationHelper.setStaticTarget(node, this.tweenConfigs.fadeInOut.out);
        });
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    async renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.MatchWinner) {
            !this.isZoomOut && this.zoomPlayArea("out");
            await Promise.all([
                AnimationHelper.playAnimByPhaseProgress(this.disappearingNodes, this.tweenConfigs.fadeInOut.out, phase.progress),
                AnimationHelper.playAnimByPhaseProgress(this.chips, this.tweenConfigs.chipsFlyDown.out, phase.progress),
            ]);

            return;
        }

        if (phase.id === PhaseId.Settlement) {
            await Promise.all([
                AnimationHelper.playAnimByPhaseProgress(this.disappearingNodes, this.tweenConfigs.fadeInOut.in, phase.progress),
                AnimationHelper.playAnimByPhaseProgress(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in, phase.progress),
            ]);

            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            this.phaseShowBetChoices = phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live";

            if (phase.progress === 0) {
                this.isZoomOut && this.zoomPlayArea("in");
                const animations: Promise<any>[] = [];

                // playAreaAnim
                animations.push(
                    AnimationHelper.playAnimByPhaseProgress(
                        [this.scoreBoard, this.mainPlayerNode, this.chips],
                        [this.tweenConfigs.scoreboardFlyUp.in, this.tweenConfigs.fadeInOut.in, this.tweenConfigs.chipsFlyDown.in],
                        0
                    )
                );

                // disappearingAnim
                animations.push(AnimationHelper.playAnimByPhaseProgress(this.disappearingNodes, this.tweenConfigs.fadeInOut.in, 0));

                // live bet
                if (phase.id === PhaseId.ShowBetChoicesLive) {
                    animations.push(
                        AnimationHelper.playAnimByPhaseProgress(this.firstHalfScore, this.tweenConfigs.teamScoreLiveFlyUp.in, 0)
                    );
                }

                await Promise.all(animations);
            } else {
                if (phase.id === PhaseId.ShowBetChoicesLive) {
                    AnimationHelper.setStaticTarget(this.firstHalfScore, this.tweenConfigs.teamScoreLiveFlyUp.in);
                }
                AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut.in);
                AnimationHelper.setStaticTarget(this.scoreBoard, this.tweenConfigs.scoreboardFlyUp.in);
                this.setStaticPlayArea("in");
            }

            return;
        }

        if (phase.id === PhaseId.ShowIntroVideo || phase.id === PhaseId.ShowPrevVideo || phase.id === PhaseId.ShowLiveVideo) {
            this.phasePreviewBets = "prev";

            await Promise.all([
                AnimationHelper.playAnimByPhaseProgress(
                    [this.teamScore, this.scoreBoard, this.mainPlayerNode],
                    [this.tweenConfigs.teamScoreFlyUp.in, this.tweenConfigs.scoreboardFlyUp.out, this.tweenConfigs.fadeInOut.out],
                    phase.progress
                ),
                !this.isZoomOut && this.zoomPlayArea("out"),
                phase.id === PhaseId.ShowLiveVideo
                    ? (() => {
                          this.phasePreviewBets = "live";
                          AnimationHelper.playAnimByPhaseProgress(
                              this.firstHalfScore,
                              this.tweenConfigs.teamScoreLiveFlyUp.out,
                              phase.progress
                          );
                      })()
                    : Promise.resolve(),
            ]);

            return;
        }
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    async renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.Halftime) {
            AnimationHelper.playAnimByPhaseProgress(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out, phase.progress);
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
                this.zoomPlayArea("in");
            }
            AnimationHelper.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        } catch (e) {}
    }

    private getMainPlayAreaTargets(): Array<{ target: Node; key: TweenKey }> {
        return this.mainPlayAreaTargets;
    }

    private async zoomPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        const targets = this.getMainPlayAreaTargets();
        await Promise.all(targets.map(({ target, key }) => AnimationHelper.playAnimForTarget(target, this.tweenConfigs[key][direction])));
    }

    private async setStaticPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        const targets = this.getMainPlayAreaTargets();
        await Promise.all(targets.map(({ target, key }) => AnimationHelper.setStaticTarget(target, this.tweenConfigs[key][direction])));
    }

    private async animateBetElements(isPreviewBets: boolean) {
        const direction = isPreviewBets ? "in" : "out";

        this.phasePreviewBets === "prev" && this.betChoicesContainer.setEnableBetChoices("prev");
        this.phasePreviewBets === "live" && this.betChoicesContainer.setEnableBetChoices("live");

        AnimationHelper.setStaticTarget(this.chips, this.tweenConfigs.chipsFlyDown[direction]);
        AnimationHelper.setStaticTarget(this.mainPlayerNode, this.tweenConfigs.fadeInOut[direction]);
        AnimationHelper.setStaticTarget(this.betChoicesParentContainer, this.tweenConfigs.betChoiceZoomInOut[direction]);
        AnimationHelper.setStaticTarget(this.chipContainersParent, this.tweenConfigs.chipContainerFlyDown[direction]);
    }

    @render(ButtonsBetStore, (store) => store.isPreviewBets, { fireImmediately: false })
    async renderButtonsBet(isPreviewBets: boolean) {
        this.betChoicesContainer.statusBetsButton.setVisibilityState(isPreviewBets);
        this.animateBetElements(isPreviewBets);
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    swapBets() {
        if (this.phaseShowBetChoices === "live" || this.phasePreviewBets === "live") {
            const isSwapBets = this.betChoicesContainer.getIsSwapBets();
            this.betChoicesContainer.setIsSwapBets(!isSwapBets);
            this.betChoicesContainer.setEnableBetChoices("live");
        }
    }
}

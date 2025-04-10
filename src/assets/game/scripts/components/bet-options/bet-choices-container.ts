import gc from "@sg/game-client-base";
import { Node, _decorator, Button } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { StatusBetsButton } from "./status-bets-button";
import { BetItemsFinal } from "./bet-items-final";
import { BetItems } from "./bet-items";
import { GamePhaseStore } from "../../features/game-phase/game-phase-store";
import { GamePhase, PhaseId } from "../../features/game-phase/game-phase-definitions";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { PreviewBetsHandler } from "../../features/preview-bets/preview-bets-handler";
import { ButtonsBetStore } from "../../features/preview-bets/buttons-bet-store";
import BetItemCustomize from "./bet-item-customize";
const { ccclass, property } = _decorator;

const { Rounds } = gc;
const { render, handle } = Observer;

type BetState = "prev" | "live" | "final";

@ccclass
export class BetChoicesContainer extends ObserverComponent {
    @property(Node)
    betChoicesPrev: Node = null;

    @property(Node)
    betChoicesLive: Node = null;

    @property(Node)
    betChoicesFinal: Node = null;

    @property(Node)
    previewBetsButton: Node = null;

    @property(Node)
    swapBetsButton: Node = null;

    loadedChips = false;
    private _totalBets: Record<string, number> = {};
    private _ownBets: Record<string, number> = {};
    private _userPercentage: Record<string, number> = {};

    statusBetsButton: StatusBetsButton = null;
    protected betItemsPrev: BetItems = null;
    protected betItemsLive: BetItems = null;
    protected betItemsFinal: BetItems = null;
    protected betChoicesInMatch = [];

    private isSwapBets: boolean = false;
    protected readonly durationShowBetChoices = 0.5;

    private betChoicesParentContainer: Node = null;
    private onPhaseHandler: (phaseId: PhaseId, action: BetState) => void = null;

    private readonly phaseConfigs = {
        [PhaseId.ShowPrevVideo]: {
            prevDisabled: true,
            previewBetsEnabled: true,
        },
        [PhaseId.ShowLiveVideo]: {
            prevDisabled: true,
            liveDisabled: true,
            previewBetsEnabled: true,
        },
        [PhaseId.Halftime]: {
            previewBetsEnabled: false,
        },
        [PhaseId.ShowBetChoicesLive]: {
            liveDisabled: false,
            previewBetsEnabled: false,
        },
        [PhaseId.ShowBetChoicesPrev]: {
            prevDisabled: false,
            previewBetsEnabled: false,
        },
        [PhaseId.Settlement]: {
            previewBetsEnabled: false,
        },
        [PhaseId.ShowWinnerAndTournament]: {
            previewBetsEnabled: false,
        },
        [PhaseId.AutoHidePreviewBetChoicesLive]: {
            previewBetsEnabled: false,
        },
        [PhaseId.AutoHidePreviewBetChoicesPrev]: {
            previewBetsEnabled: false,
        },
    };

    onLoad(): void {
        this.betItemsPrev = this.betChoicesPrev.getComponent(BetItems);
        this.betItemsLive = this.betChoicesLive.getComponent(BetItems);
        this.betItemsFinal = this.betChoicesFinal.getComponent(BetItems);
        this.betChoicesInMatch = [this.betItemsPrev, this.betItemsLive, this.betItemsFinal];

        [this.betChoicesPrev, this.betChoicesLive, this.betChoicesFinal].forEach((choice) => (choice.active = false));
        this.statusBetsButton = this.previewBetsButton?.getComponent(StatusBetsButton);
        this.setEnabledPreviewBets(false);
        this.betChoicesParentContainer = this.betChoicesPrev?.parent;

        this.previewBetsButton.on(Button.EventType.CLICK, this.showHideBets, this);

        super.onLoad();
    }

    @render(Rounds.RoundStore, (store) => store.totalBets)
    renderTotalBets(totalBets: gc.GameServiceMessage.TotalBets) {
        this._totalBets = totalBets;
    }

    @render(Rounds.RoundStore, (store) => store.ownBets)
    renderOwnBets(ownBets: gc.GameServiceMessage.OwnBets) {
        this._ownBets = ownBets;
    }

    @render(Rounds.RoundStore, (store) => store.userBetPercentage)
    renderUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        this._userPercentage = userBetPercentage;
    }

    init(onPhaseHandler?: (phaseId: PhaseId, action: BetState) => void) {
        this.onPhaseHandler = onPhaseHandler;
    }

    private applyPhaseConfig(phaseId: PhaseId): void {
        const config = this.phaseConfigs[phaseId];
        if (!config) {
            return;
        }

        if (typeof config.prevDisabled === "boolean") {
            this.setDisabledBetChoices("prev", config.prevDisabled);
        }

        if (typeof config.liveDisabled === "boolean") {
            this.setDisabledBetChoices("live", config.liveDisabled);
        }

        this.setEnabledPreviewBets(config.previewBetsEnabled);
    }

    private handleWinnerPhase(phase: GamePhase): void {
        if (phase.progress === 0) {
            const duration = 0.2;
            this.scheduleOnce(() => this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, duration), 0.8);
        } else {
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, 0);
        }
    }

    private handleSettlementPhase(): void {
        this.setEnableBetChoices("final");
        this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, 0);
    }

    private handleBetChoicesPhase(phase: GamePhase): void {
        const action: BetState = phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live";

        if (phase.progress === 0) {
            this.scheduleBetChoiceFadeIn(action);
        } else {
            this.setEnableBetChoices(action, this.isSwapBets);
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, 0);
        }

        // Notify play area about this phase if needed
        if (this.onPhaseHandler) {
            this.onPhaseHandler(phase.id as PhaseId, action);
        }
    }

    private handleAutoHidePreviewPhase(): void {
        this.setPreviewBets(false);
        this.setDisableBetChoices();
        this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, this.durationShowBetChoices);
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        this.isSwapBets = false;

        // Apply phase-specific UI configurations
        this.applyPhaseConfig(phase.id as PhaseId);

        // Handle specific phase behaviors
        if (phase.id === PhaseId.ShowWinnerAndTournament) {
            this.handleWinnerPhase(phase);
            return;
        }

        if (phase.id === PhaseId.Settlement) {
            this.handleSettlementPhase();
            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            this.handleBetChoicesPhase(phase);
            return;
        }

        if (phase.id === PhaseId.AutoHidePreviewBetChoicesLive || phase.id === PhaseId.AutoHidePreviewBetChoicesPrev) {
            this.handleAutoHidePreviewPhase();
        }
    }

    private setDisabledBetChoices(type: "prev" | "live", isDisabled: boolean) {
        const node = type === "prev" ? this.betChoicesPrev : this.betChoicesLive;
        const betItems = node?.getComponent(BetItems)?.getComponentsInChildren(BetItemCustomize);
        betItems?.forEach((betItem) => {
            betItem && betItem.setDisabledVisibility(isDisabled);
        });
    }

    private setEnabledPreviewBets(isEnabled: boolean) {
        isEnabled && this.statusBetsButton.setVisibilityState(false);
        this.previewBetsButton && (this.previewBetsButton.active = isEnabled);
    }

    setEnableBetChoices(state: "prev" | "live" | "final", isSwapBets: boolean = false) {
        this.betChoicesPrev.active = state === "prev";
        this.betChoicesFinal.active = state === "final";
        this.swapBetsButton.active = state === "live";

        const triggerByState = {
            prev: this.triggerBoundFirstHalfChips.bind(this),
            live: this.triggerBoundSecondHalfChips.bind(this),
            final: this.handleAfterActiveBetItemsFinal.bind(this),
        };

        const trigger = triggerByState[state];

        if (state === "live") {
            this.betChoicesPrev.active = isSwapBets;
            this.betChoicesLive.active = !isSwapBets;
        }

        trigger();
    }

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundFirstHalfChips())
    triggerBoundFirstHalfChips() {}

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundSecondHalfChips())
    triggerBoundSecondHalfChips() {}

    setDisableBetChoices() {
        this.betChoicesPrev.active = false;
        this.betChoicesLive.active = false;
        this.betChoicesFinal.active = false;
        this.swapBetsButton.active = false;
    }

    handleAfterActiveBetItemsFinal() {
        const finalBetItems = this.betChoicesFinal.getComponent(BetItemsFinal);
        finalBetItems.bindTotalBets(this._totalBets);
        finalBetItems.bindOwnBets(this._ownBets);
        finalBetItems.bindUserBetPercentage(this._userPercentage);
        this.triggerLoadedChips();
    }

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundFinalChips())
    triggerLoadedChips() {}

    setDisableBetChoicesInMatch() {
        this.betChoicesInMatch.forEach((node) => {
            node && (node.active = false);
        });
    }

    getBetItemsPrevMath() {
        return this.betItemsPrev;
    }

    getBetItemsLive() {
        return this.betItemsLive;
    }

    getBetItemsFinal() {
        return this.betItemsFinal;
    }

    betItemsGetReady() {
        return this.betItemsPrev.betItemComponents.length > 0 || this.betItemsLive.betItemComponents.length > 0;
    }

    async betItemsByChoice() {
        const betItemsByChoice: Record<string, BetItem> = {};
        const betItemsPrev = this.betChoicesPrev.getComponent(BetItems).getComponentsInChildren(BetItem);
        const betItemsLive = this.betChoicesLive.getComponent(BetItems).getComponentsInChildren(BetItem);

        for (const betItem of betItemsLive) {
            betItemsByChoice[betItem.betChoice] = betItem;
        }
        for (const betItem of betItemsPrev) {
            betItemsByChoice[betItem.betChoice] = betItem;
        }
        return betItemsByChoice;
    }

    betItemsByChoiceFinal() {}

    fadeOutBetChoiceNode(node: Node, fadeOut: boolean, duration: number) {
        const opacity = fadeOut ? 1 : 255;

        if (duration === 0) {
            AnimationUtils.setOpacityNode(node, opacity);
            return;
        }

        fadeOut ? AnimationUtils.fadeOut(node, duration) : AnimationUtils.fadeIn(node, duration);
    }

    scheduleBetChoiceFadeIn(action: BetState, duration?: number) {
        this.scheduleOnce(() => {
            this.setEnableBetChoices(action, this.isSwapBets);
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, duration ?? this.durationShowBetChoices);
        }, duration ?? this.durationShowBetChoices);
    }

    scheduleBetChoiceFadeOut(duration?: number) {
        this.scheduleOnce(() => {
            this.setDisableBetChoices();
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, duration ?? this.durationShowBetChoices);
        }, duration ?? this.durationShowBetChoices);
    }

    getIsSwapBets(): boolean {
        return this.isSwapBets;
    }

    setIsSwapBets(value: boolean): void {
        this.isSwapBets = value;
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
            this.scheduleBetChoiceFadeIn(phaseActions[phase.id]);
        }
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.setIsSwapBets(false);
        this.setPreviewBets(!this.statusBetsButton.getPreviewStatus());
    }

    @handle(PreviewBetsHandler, (handle, isPreviewBets: boolean) => handle.handlePreviewBets(isPreviewBets))
    private setPreviewBets(isPreviewBets: boolean) {
        return isPreviewBets;
    }

    @render(ButtonsBetStore, (store) => store.isPreviewBets, { fireImmediately: false })
    async renderButtonsBet(isPreviewBets: boolean) {
        this.statusBetsButton.setPreviewStatus(isPreviewBets);
    }
}

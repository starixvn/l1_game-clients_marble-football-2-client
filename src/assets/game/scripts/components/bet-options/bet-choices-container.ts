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
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
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
    private chipContainerPrev: Node = null;

    @property(Node)
    private chipContainerLive: Node = null;

    @property(Node)
    private chipContainerFinal: Node = null;

    @property(Node)
    previewBetsButton: Node = null;

    @property(Node)
    swapBetsButton: Node = null;

    statusBetsButton: StatusBetsButton = null;

    protected betItemsPrev: BetItems = null;
    protected betItemsLive: BetItems = null;
    protected betItemsFinal: BetItems = null;
    protected betChoicesInMatch = [];
    protected readonly durationShowBetChoices = 0.5;

    private _odds: OddsWithConfig = null;
    private _totalBets: Record<string, number> = {};
    private _ownBets: Record<string, number> = {};
    private _userPercentage: Record<string, number> = {};
    private _bindDataFirstHalf = false;
    private _bindDataSecondHalf = false;
    private isSwapBets: boolean = false;
    private betChoicesParentContainer: Node = null;
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
            liveDisabled: false,
        },
        [PhaseId.ShowBetChoicesLive]: {
            liveDisabled: false,
            previewBetsEnabled: false,
            prevDisabled: true,
        },
        [PhaseId.ShowBetChoicesPrev]: {
            previewBetsEnabled: false,
            prevDisabled: false,
        },
        [PhaseId.Settlement]: {
            previewBetsEnabled: false,
        },
        [PhaseId.MatchWinner]: {
            previewBetsEnabled: false,
        },
        [PhaseId.Tournament]: {
            previewBetsEnabled: false,
        },
        [PhaseId.AutoHidePreviewBetChoicesLive]: {
            previewBetsEnabled: false,
            liveDisabled: false,
            prevDisabled: false,
        },
        [PhaseId.AutoHidePreviewBetChoicesPrev]: {
            previewBetsEnabled: false,
        },
    };
    private readonly triggerByState = {
        prev: this.handleAfterActiveBetItemsFirstHalf.bind(this),
        live: this.handleAfterActiveBetItemsSecondHalf.bind(this),
        final: this.handleAfterActiveBetItemsFinal.bind(this),
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
        this.swapBetsButton.active = false;
        super.onLoad();

        this.previewBetsButton.on(Button.EventType.CLICK, this.showHideBets, this);
    }

    @render(OddsStore, (store) => store.oddsWithConfig)
    renderOdds(oddsWithConfig: OddsWithConfig) {
        this._odds = oddsWithConfig;
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
            this.scheduleOnce(() => this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, this.durationShowBetChoices), 0.2);
        } else {
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, 0);
        }
    }

    private handleSettlementPhase(): void {
        this.handleBetState("final", this.durationShowBetChoices);
    }

    private handleBetState(state: BetState, duration: number): void {
        this.setEnableBetChoices(state);
        this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, duration);
    }

    private handleBetChoicesPhase(phase: GamePhase): void {
        const action = phase.id === PhaseId.ShowBetChoicesPrev ? "prev" : "live";
        const duration = phase.progress === 0 ? this.durationShowBetChoices : 0;
        this.handleBetState(action, duration);
    }

    private handleAutoHidePreviewPhase(): void {
        this.setPreviewBets(false);
        this.setDisableBetChoices();
        this.resetSwapBets();
        this.fadeOutBetChoiceNode(this.betChoicesParentContainer, true, this.durationShowBetChoices);
    }

    private resetSwapBets(): void {
        this.swapBetsButton.active = false;
        this.isSwapBets = false;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        // Apply phase-specific UI configurations
        this.applyPhaseConfig(phase.id as PhaseId);

        // Handle specific phase behaviors
        if (phase.id === PhaseId.MatchWinner) {
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

    setEnableBetChoices(state: "prev" | "live" | "final") {
        let triggerState = state;

        this.betChoicesPrev.active = state === "prev";
        this.betChoicesLive.active = state === "live";
        this.betChoicesFinal.active = state === "final";
        this.swapBetsButton.active = state === "live";

        if (state === "live") {
            triggerState = this.isSwapBets ? "prev" : "live";
            this.betChoicesPrev.active = this.isSwapBets;
            this.betChoicesLive.active = !this.isSwapBets;
        }

        this.setEnableChipContainer();

        const trigger = this.triggerByState[triggerState];

        trigger();
    }

    private setEnableChipContainer() {
        this.chipContainerPrev.active = this.betChoicesPrev.active;
        this.chipContainerLive.active = this.betChoicesLive.active;
        this.chipContainerFinal.active = this.betChoicesFinal.active;
    }

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundFirstHalfChips())
    triggerBoundFirstHalfChips() {}

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundSecondHalfChips())
    triggerBoundSecondHalfChips() {}

    private setDisableBetChoices() {
        this.betChoicesPrev.active = false;
        this.betChoicesLive.active = false;
        this.betChoicesFinal.active = false;
    }

    private handleAfterActiveBetItemsFinal() {
        const finalBetItems = this.betChoicesFinal.getComponent(BetItemsFinal);
        finalBetItems.bindTotalBets(this._totalBets);
        finalBetItems.bindOwnBets(this._ownBets);
        finalBetItems.bindUserBetPercentage(this._userPercentage);
        this.triggerLoadedChips();
    }

    private handleAfterActiveBetItems(betItems: BetItems, bindFlag: boolean, triggerMethod: () => void) {
        if (betItems.betItemComponents.length === 0) {
            this.scheduleOnce(() => {
                this.handleAfterActiveBetItems(betItems, bindFlag, triggerMethod);
            }, 0.1);
            return;
        }
        if (!bindFlag) {
            betItems.renderTotalBets(this._totalBets);
            betItems.renderOwnBets(this._ownBets);
            betItems.handleUserBetPercentage(this._userPercentage);
            betItems.renderOdds(this._odds);
        }
        triggerMethod();
    }

    private handleAfterActiveBetItemsFirstHalf() {
        const firstHalfBetItems = this.betChoicesPrev.getComponent(BetItems);
        this.handleAfterActiveBetItems(firstHalfBetItems, this._bindDataFirstHalf, () => {
            this._bindDataFirstHalf = true;
            this.triggerBoundFirstHalfChips();
        });
    }

    private handleAfterActiveBetItemsSecondHalf() {
        const secondHalfBetItems = this.betChoicesLive.getComponent(BetItems);
        this.handleAfterActiveBetItems(secondHalfBetItems, this._bindDataSecondHalf, () => {
            this._bindDataSecondHalf = true;
            this.triggerBoundSecondHalfChips();
        });
    }

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundFinalChips())
    triggerLoadedChips() {}

    getBetItemsPrevMath() {
        return this.betItemsPrev;
    }

    getBetItemsLive() {
        return this.betItemsLive;
    }

    getBetItemsFinal() {
        return this.betItemsFinal;
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

    private fadeOutBetChoiceNode(node: Node, fadeOut: boolean, duration: number) {
        const opacity = fadeOut ? 1 : 255;

        if (duration === 0) {
            AnimationUtils.setOpacityNode(node, opacity);
            return;
        }

        fadeOut ? AnimationUtils.fadeOut(node, duration) : AnimationUtils.fadeIn(node, duration);
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
            this.setEnableBetChoices(phaseActions[phase.id]);
            this.fadeOutBetChoiceNode(this.betChoicesParentContainer, false, this.durationShowBetChoices);
        }
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.setIsSwapBets(false);
        this.setPreviewBets(!this.statusBetsButton.getPreviewStatus());
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    hideBets() {
        this.setIsSwapBets(false);
        this.setPreviewBets(false);
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

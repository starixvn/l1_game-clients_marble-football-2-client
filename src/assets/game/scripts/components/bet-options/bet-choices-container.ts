import gc from "@sg/game-client-base";
import { Node, _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { StatusBetsButton } from "./status-bets-button";
import { BetItemsFinal } from "./bet-items-final";
import { BetItems } from "./bet-items";
import { GamePhaseStore } from "../../features/game-phase/game-phase-store";
import { GamePhase, PhaseId } from "../../features/game-phase/game-phase-definitions";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { FunctionUtils } from "db://shared-components/shared/utils";
import { PreviewBetsHandler } from "../../features/preview-bets/preview-bets-handler";
const { ccclass, property } = _decorator;

const { Rounds } = gc;
const { render, handle } = Observer;

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

    loadedChips = false;

    private _totalBets: Record<string, number> = {};
    private _ownBets: Record<string, number> = {};
    private _userPercentage: Record<string, number> = {};

    statusBetsButton: StatusBetsButton = null;
    protected betItemsPrev: BetItems = null;
    protected betItemsLive: BetItems = null;
    protected betItemsFinal: BetItems = null;
    protected betChoicesInMatch = [];

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

    onLoad(): void {
        this.betItemsPrev = this.betChoicesPrev.getComponent(BetItems);
        this.betItemsLive = this.betChoicesLive.getComponent(BetItems);
        this.betItemsFinal = this.betChoicesFinal.getComponent(BetItems);
        this.betChoicesInMatch = [this.betItemsPrev, this.betItemsLive, this.betItemsFinal];

        [this.betChoicesPrev, this.betChoicesLive, this.betChoicesFinal].forEach((choice) => (choice.active = false));
        this.statusBetsButton = this.previewBetsButton.getComponentInChildren(StatusBetsButton);
        this.setEnabledPreviewBets(false);
        super.onLoad();
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private next() {
        this.toggleChoices();
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private prev() {
        this.toggleChoices();
    }

    private toggleChoices(): void {
        const isFirstActive = this.betChoicesPrev.active;
        this.setActiveState(!isFirstActive);
    }

    private setActiveState(isFirstActive: boolean): void {
        this.betChoicesPrev.active = isFirstActive;
        this.betChoicesLive.active = !isFirstActive;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        const phaseConfigs = {
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
        };

        const config = phaseConfigs[phase.id];
        if (config) {
            this.setDisabledBetChoices("prev", config.prevDisabled);
            if (typeof config.liveDisabled === "boolean") {
                this.setDisabledBetChoices("live", config.liveDisabled);
            }
            this.setEnabledPreviewBets(config.previewBetsEnabled);
        }
    }

    private setDisabledBetChoices(type: "prev" | "live", isDisabled: boolean) {
        const node = type === "prev" ? this.betChoicesPrev : this.betChoicesLive;
        const bgDisable = node.getComponent(BetItems)?.bgDisable;
        bgDisable && (bgDisable.active = isDisabled);
    }

    private setEnabledPreviewBets(isEnabled: boolean) {
        isEnabled && this.statusBetsButton.setVisibilityState(false);
        this.previewBetsButton.active = isEnabled;
    }

    setEnableBetChoices(state: "prev" | "live" | "final") {
        this.betChoicesPrev.active = state === "prev";
        this.betChoicesLive.active = state === "live";
        this.betChoicesFinal.active = state === "final";

        if (state === "final") {
            this.handleAfterActiveBetItemsFinal();
        }
    }

    setDisableBetChoices() {
        this.betChoicesPrev.active = false;
        this.betChoicesLive.active = false;
        this.betChoicesFinal.active = false;
    }

    handleAfterActiveBetItemsFinal() {
        const finalBetItems = this.betChoicesFinal.getComponent(BetItemsFinal);
        finalBetItems.bindTotalBets(this._totalBets);
        finalBetItems.bindOwnBets(this._ownBets);
        finalBetItems.bindUserBetPercentage(this._userPercentage);
        this.triggerLoadedChips();
    }

    @handle(PreviewBetsHandler, (handle) => handle.triggerBoundChips())
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
}

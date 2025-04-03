import gc from "@sg/game-client-base";
import { Node, _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { StatusBetsButton } from "./status-bets-button";
import { BetItemsFinal } from "./bet-items-final";
import { BetItems } from "./bet-items";
import { GamePhaseStore } from "../../features/game-phase/game-phase-store";
import { GamePhase, PhaseId } from "../../features/game-phase/game-phase-definitions";
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

        const phaseHandlers = {
            [PhaseId.ShowIntroVideo]: () => {
                this.setDisabledBetChoices("prev", true);
            },
            [PhaseId.ShowPrevVideo]: () => {
                this.setDisabledBetChoices("prev", true);
                this.setEnabledPreviewBets(true);
            },
            [PhaseId.ShowLiveVideo]: () => {
                this.setDisabledBetChoices("prev", true);
                this.setDisabledBetChoices("live", true);
                this.setEnabledPreviewBets(true);
            },
            default: () => {
                this.setDisabledBetChoices("prev", false);
                this.setDisabledBetChoices("live", false);
                this.setEnabledPreviewBets(false);
            },
        };

        const handler = phaseHandlers[phase.id] || phaseHandlers.default;
        console.log("renderEnterPhase: selected handler =", phase.id in phaseHandlers ? phase.id : "default");
        handler();
    }

    private setDisabledBetChoices(type: "prev" | "live", isDisabled: boolean) {
        const node = type === "prev" ? this.betChoicesPrev : this.betChoicesLive;
        const bgDisable = node.getComponent(BetItems)?.bgDisable;
        bgDisable && (bgDisable.active = isDisabled);
    }

    private setEnabledPreviewBets(isEnabled: boolean) {
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
    }

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
}

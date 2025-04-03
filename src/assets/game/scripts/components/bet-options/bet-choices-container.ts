import gc from "@sg/game-client-base";
import { Node, _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { HelperBetChoices } from "../../helper-betchoices";
import { StatusBetsButton } from "./status-bets-button";
import { BetItems } from "./bet-items";
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
    showHideBetsButton: Node = null;

    protected statusBetsButton: StatusBetsButton = null;
    protected betItemsPrev: BetItems = null;
    protected betItemsLive: BetItems = null;
    protected betItemsFinal: BetItems = null;
    protected betChoicesInMatch = [];

    onLoad(): void {
        this.betItemsPrev = this.betChoicesPrev.getComponent(BetItems);
        this.betItemsLive = this.betChoicesLive.getComponent(BetItems);
        this.betItemsFinal = this.betChoicesFinal.getComponent(BetItems);
        this.betChoicesInMatch = [this.betItemsPrev, this.betItemsLive, this.betItemsFinal];

        [this.betChoicesPrev, this.betChoicesLive, this.betChoicesFinal].forEach((choice) => (choice.active = false));
        this.statusBetsButton = this.showHideBetsButton.getComponentInChildren(StatusBetsButton);
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

    private handleBetItemClick(event: any): void {
        // Handle bet item click event
        console.log("Bet item clicked");
    }

    setFirstHalfDisabled(isDisabled: boolean) {
        const bgDisable = this.betChoicesPrev.getComponent(BetItems)?.bgDisable;
        bgDisable && (bgDisable.active = isDisabled);
    }

    setEnableBetChoices(state: "prev" | "live" | "final") {
        const isLive = state === "live";
        if (state !== "final") {
            this.setFirstHalfDisabled(isLive);
        }

        this.betChoicesPrev.active = state === "prev";
        this.betChoicesLive.active = state === "live";
        this.betChoicesFinal.active = state === "final";
    }

    setDisableBetChoicesInMatch() {
        this.betChoicesInMatch.forEach((node) => {
            node && (node.active = false);
        });
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.statusBetsButton.toggleStatus();
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

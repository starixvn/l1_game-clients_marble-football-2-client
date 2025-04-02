import gc from "@sg/game-client-base";
import { EventTouch, Node, _decorator } from "cc";
import { BetItems } from "db://shared-components/game/bets/scripts/components/bet-items";
import { BetItemsPolygon } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { HelperBetChoices } from "../../helper-betchoices";
import { StatusBetsButton } from "./status-bets-button";
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
    protected betItemsPrev: BetItemsPolygon = null;
    protected betItemsLive: BetItemsPolygon = null;

    onLoad(): void {
        this.betItemsPrev = this.betChoicesPrev.getComponent(BetItemsPolygon);
        this.betItemsLive = this.betChoicesLive.getComponent(BetItemsPolygon);

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

        // Get BetItemsPolygon component and bind touch event
        const activeNode = isFirstActive ? this.betChoicesPrev : this.betChoicesLive;
        const betItemsPolygon = activeNode.getComponent(BetItemsPolygon);
        if (betItemsPolygon) {
            betItemsPolygon.node.on(Node.EventType.TOUCH_END, betItemsPolygon.handleBetItemClick, betItemsPolygon);
        }
    }

    private handleBetItemClick(event: any): void {
        // Handle bet item click event
        console.log("Bet item clicked");
    }

    setFirstHalfDisabled(isDisabled: boolean) {
        const bgDisable = this.betChoicesPrev.getComponent(HelperBetChoices)?.bgDisable;
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

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.statusBetsButton.toggleStatus();
    }

    getBetItemsPrevMath() {
        return this.betChoicesPrev.getComponent(BetItems);
    }

    getBetItemsLive() {
        return this.betChoicesLive.getComponent(BetItems);
    }

    getBetItemsFinal() {
        return this.betChoicesFinal.getComponent(BetItems);
    }
}

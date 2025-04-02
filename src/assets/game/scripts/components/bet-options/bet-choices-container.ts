import gc from "@sg/game-client-base";
import { Node, _decorator } from "cc";
import { BetItems } from "db://shared-components/game/bets/scripts/components/bet-items";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { HelperBetChoices } from "../../helper-betchoices";
import { StatusBetsButton } from "./status-bets-button";
import { BetItemsPolygon } from "./bet-items";
const { ccclass, property } = _decorator;

const { Rounds } = gc;
const { render, handle } = Observer;

@ccclass
export class BetChoicesContainer extends ObserverComponent {
    @property(Node)
    betChoicesPrev: Node = null;

    @property(Node)
    betChoicesLLive: Node = null;

    @property(Node)
    showHideBetsButton: Node = null;

    protected statusBetsButton: StatusBetsButton = null;

    onLoad(): void {
        this.betChoicesPrev.active = false;
        this.betChoicesLLive.active = false;
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
        this.betChoicesLLive.active = !isFirstActive;

        // Get BetItemsPolygon component and bind touch event
        const activeNode = isFirstActive ? this.betChoicesPrev : this.betChoicesLLive;
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

    setEnableBetChoicesPrev() {
        this.setFirstHalfDisabled(false);
        this.betChoicesPrev.active = true;
        this.betChoicesLLive.active = false;
        this.initTouchEvent(false);
    }

    setEnableAllBets() {
        this.setFirstHalfDisabled(true);
        this.betChoicesPrev.active = false;
        this.betChoicesLLive.active = true;
        this.initTouchEvent(true);
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.statusBetsButton.toggleStatus();
    }

    getBetItemsPrevMath() {
        return this.betChoicesPrev.getComponent(BetItems);
    }

    getBetItemsLive() {
        return this.betChoicesLLive.getComponent(BetItems);
    }

    initTouchEvent(isLive: boolean) {
        const betItemsPrev = this.betChoicesPrev.getComponent(BetItemsPolygon);
        const betItemsLive = this.betChoicesLLive.getComponent(BetItemsPolygon);
        if (isLive) {
            betItemsLive.node.on(Node.EventType.TOUCH_END, betItemsLive.handleBetItemClick, betItemsLive);
            betItemsPrev.node.off(Node.EventType.TOUCH_END, betItemsPrev.handleBetItemClick, betItemsPrev);
        } else {
            betItemsPrev.node.on(Node.EventType.TOUCH_END, betItemsPrev.handleBetItemClick, betItemsPrev);
            betItemsLive.node.off(Node.EventType.TOUCH_END, betItemsLive.handleBetItemClick, betItemsLive);
        }
    }
}

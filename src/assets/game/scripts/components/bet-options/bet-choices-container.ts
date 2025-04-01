import gc from "@sg/game-client-base";
import { Node, _decorator } from "cc";
import { BetItems } from "db://shared-components/game/bets/scripts/components/bet-items";
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
    firstHalfBetChoices: Node = null;

    @property(Node)
    secondHalfBetChoices: Node = null;

    @property(Node)
    showHideBetsButton: Node = null;

    protected statusBetsButton: StatusBetsButton = null;

    onLoad(): void {
        this.firstHalfBetChoices.active = false;
        this.secondHalfBetChoices.active = false;
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
        const isFirstActive = this.firstHalfBetChoices.active;
        this.setActiveState(!isFirstActive);
    }

    private setActiveState(isFirstActive: boolean): void {
        this.firstHalfBetChoices.active = isFirstActive;
        this.secondHalfBetChoices.active = !isFirstActive;
    }

    setFirstHalfDisabled(isDisabled: boolean) {
        const bgDisable = this.firstHalfBetChoices.getComponent(HelperBetChoices)?.bgDisable;
        bgDisable && (bgDisable.active = isDisabled);
    }

    setEnableFirstHalfBets() {
        this.setFirstHalfDisabled(false);
        this.firstHalfBetChoices.active = true;
        this.secondHalfBetChoices.active = false;
    }

    setEnableAllBets() {
        this.setFirstHalfDisabled(true);
        this.firstHalfBetChoices.active = false;
        this.secondHalfBetChoices.active = true;
    }

    @handle(gc.Audios.AudioHandler, (handle) => handle.playSFX(gc.Audios.AudioIds.CLICK))
    private showHideBets() {
        this.statusBetsButton.toggleStatus();
    }

    getBetItemsPrevMath() {
        return this.firstHalfBetChoices.getComponent(BetItems);
    }

    getBetItemsLive() {
        return this.secondHalfBetChoices.getComponent(BetItems);
    }
}

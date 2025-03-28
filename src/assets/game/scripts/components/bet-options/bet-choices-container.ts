import gc from "@sg/game-client-base";
import { Label, Node, UITransform, _decorator } from "cc";
import Observer from "observer";
import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { HelperBetChoices } from "../../helper-betchoices";
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
    buttons: Node = null;

    onLoad(): void {
        this.firstHalfBetChoices.active = false;
        this.secondHalfBetChoices.active = false;
        this.setButtonsActiveState(false);
        super.onLoad();
    }

    setButtonsActiveState(isActive: boolean) {
        this.buttons.active = isActive;
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

    setFirstHalfBetChoicesDisabledState(isDisabled: boolean) {
        const bgDisable = this.firstHalfBetChoices.getComponent(HelperBetChoices).bgDisable;
        bgDisable.active = isDisabled;
    }
}

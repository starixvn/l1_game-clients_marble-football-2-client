import { Button, Node, _decorator } from "cc";
const { ccclass, property } = _decorator;

export enum ButtonState {
    NORMAL,
    HOVER,
    PRESSED,
    DISABLED,
}

@ccclass("StatusBetsButton")
export class StatusBetsButton extends Button {
    @property(Node)
    showNode: Node = null;

    @property(Node)
    hideNode: Node = null;

    setVisibilityState(status: boolean) {
        this.showNode.active = !status;
        this.hideNode.active = status;
    }
}

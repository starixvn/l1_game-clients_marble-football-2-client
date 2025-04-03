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

    setStatus(isShow: boolean) {
        this.showNode.active = isShow;
        this.hideNode.active = !isShow;
    }
}

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

    toggleStatus() {
        this.showNode.active = !this.showNode.active;
        this.hideNode.active = !this.hideNode.active;
    }

    setShowNodeActive(isActive: boolean) {
        this.showNode.active = isActive;
    }

    setHideNodeActive(isActive: boolean) {
        this.hideNode.active = isActive;
    }
}

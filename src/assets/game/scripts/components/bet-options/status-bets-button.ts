import { Button, Node, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("StatusBetsButton")
export class StatusBetsButton extends Button {
    @property(Node)
    showNode: Node = null;

    @property(Node)
    hideNode: Node = null;

    private _isPreview = false;

    setVisibilityState(status: boolean) {
        this.showNode.active = !status;
        this.hideNode.active = status;
    }

    setPreviewStatus(status: boolean) {
        this._isPreview = status;
    }

    getPreviewStatus() {
        return this._isPreview;
    }
}

import { Button, _decorator } from "cc";
const { ccclass } = _decorator;

@ccclass("SwapBetsButton")
export class SwapBetsButton extends Button {
    onLoad() {
        this.node.active = false;
    }

    setVisibilityState(status: boolean) {
        this.node.active = status;
    }
}

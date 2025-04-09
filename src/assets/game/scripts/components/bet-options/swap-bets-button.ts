import { Button, Node, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SwapBetsButton")
export class SwapBetsButton extends Button {
    setVisibilityState(status: boolean) {
        this.node.active = status;
    }
}

import { _decorator, CCInteger, CCString, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SetZIndex")
export class SetZIndex extends Component {
    @property([CCString])
    id: string = "webview-wrapper";

    @property([CCInteger])
    zIndex: number = 99;

    start() {
        document.getElementById(this.id).style.zIndex = this.zIndex.toString();
    }
}

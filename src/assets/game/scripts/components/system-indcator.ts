import { _decorator, Component, Enum, Node } from "cc";

const { ccclass, property } = _decorator;

enum NetworkStatus {
    DISCONNECTED = 1,
    BAD = 2, // Play 240p
    GOOD = 3, // Play 720p
}

@ccclass("SystemIndicator")
export class SystemIndicator extends Component {
    private _networkStatus: NetworkStatus = NetworkStatus.GOOD;

    @property(Node)
    private icon: Node = null;

    @property({ type: Enum(NetworkStatus) })
    get networkStatus() {
        return this._networkStatus;
    }

    set networkStatus(value: NetworkStatus) {
        this._networkStatus = value;

        this.icon.children.forEach((child, index) => {
            child.active = index + 1 === value;
        });
    }
}

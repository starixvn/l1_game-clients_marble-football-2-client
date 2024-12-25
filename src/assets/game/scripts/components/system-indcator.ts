import { _decorator, Component, Enum, sp } from "cc";

const { ccclass, property } = _decorator;

export enum NetworkStatus {
    DISCONNECTED = 1,
    BAD = 2, // Play 240p
    GOOD = 3, // Play 720p
}

@ccclass("SystemIndicator")
export class SystemIndicator extends Component {
    private _networkStatus: NetworkStatus = NetworkStatus.GOOD;

    @property(sp.Skeleton)
    private icon: sp.Skeleton = null;

    @property({ type: Enum(NetworkStatus) })
    get networkStatus() {
        return this._networkStatus;
    }

    set networkStatus(value: NetworkStatus) {
        this._networkStatus = value;

        if (value === NetworkStatus.GOOD) {
            this.icon.animation = "wifi green";
        } else if (value === NetworkStatus.BAD) {
            this.icon.animation = "wifi yellow";
        } else {
            this.icon.animation = "wifi red";
        }
    }
}

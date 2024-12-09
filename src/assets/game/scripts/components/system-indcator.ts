import { _decorator, Color, Component, Enum, Sprite } from "cc";

const { ccclass, property } = _decorator;

enum NetworkStatus {
    DISCONNECTED = 1,
    BAD = 2, // Play 240p
    GOOD = 3, // Play 720p
}

@ccclass("SystemIndicator")
export class SystemIndicator extends Component {
    private _networkStatus: NetworkStatus = NetworkStatus.GOOD;

    private statusColorMapping = {
        [NetworkStatus.GOOD]: "#47df53",
        [NetworkStatus.BAD]: "#f6c439",
        [NetworkStatus.DISCONNECTED]: "#f63a39",
    };

    @property(Sprite)
    private icon: Sprite = null;

    @property({ type: Enum(NetworkStatus) })
    get networkStatus() {
        return this._networkStatus;
    }

    set networkStatus(value: NetworkStatus) {
        this._networkStatus = value;

        if (this.icon) {
            this.icon.color = new Color(this.statusColorMapping[value]);
        }
    }
}

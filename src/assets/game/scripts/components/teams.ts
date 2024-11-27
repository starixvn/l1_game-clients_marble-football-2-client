import { _decorator, Component, Label } from "cc";
import { Flag } from "./flag";

const { ccclass, property } = _decorator;

@ccclass("Teams")
export class Teams extends Component {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    onLoad() {
        // TODO: Remove this
        this.home.setIcon("MCI");
        this.away.setIcon("RMA");
    }

    setHome(home: string) {
        this.home.setIcon(home);
    }

    setAway(away: string) {
        this.away.setIcon(away);
    }
}

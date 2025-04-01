import { _decorator } from "cc";
import { ScoreboardDataReceiver } from "db://shared-components/game/scoreboards/scripts/components/scoreboard-data-receiver";

const { ccclass } = _decorator;

@ccclass
export class MarbleScoreboardDataReceiver extends ScoreboardDataReceiver {
    public toggleBlinkNode(active: boolean) {
        return;
    }
}

import { _decorator, Component, Node, sp } from "cc";
import { Flag } from "./flag";
import { TeamName } from "./team-name";

const { ccclass, property } = _decorator;

@ccclass("Winner")
export class Winner extends Component {
    @property(sp.Skeleton)
    private winner: sp.Skeleton = null;

    @property(sp.Skeleton)
    private champion: sp.Skeleton = null;

    playChampion(at = 0, winner: string) {
        this.playAnimation(this.champion, "champion", at);
        this.setWinnerName(this.champion.node, winner);
    }

    playWinner(at = 0, winner: string) {
        this.playAnimation(this.winner, "winner", at);
        this.setWinnerName(this.winner.node, winner);
    }

    setWinnerName(node: Node, name: string) {
        node.getChildByName("team-name").getComponent(TeamName).setName(name);
        node.getComponentInChildren(Flag)?.setIcon(name);
    }

    protected onLoad(): void {
        this.winner!.node.active = false;
        this.champion!.node.active = false;
    }

    protected onDisable(): void {
        this.winner!.node.active = false;
        this.champion!.node.active = false;
    }

    private playAnimation(spine: sp.Skeleton, name: string, at = 0) {
        spine.node.active = true;

        spine.setAnimation(0, name, false);

        const animation = spine.findAnimation(name);
        const entry = spine.getCurrent(0);

        if (at > animation.duration) {
            entry.trackTime = animation.duration;
        } else {
            entry.trackTime = at;
        }

        spine.setCompleteListener(() => {
            spine.node.active = false;
        });
    }
}

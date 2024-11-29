import { _decorator, Component, Node, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Winner")
export class Winner extends Component {
    @property(sp.Skeleton)
    private winner: sp.Skeleton = null;

    @property(sp.Skeleton)
    private champion: sp.Skeleton = null;

    playChampion(at = 0) {
        this.playAnimation(this.champion, "champion", at);
    }

    playWinner(at = 0) {
        this.playAnimation(this.winner, "winner", at);
    }

    protected onEnable(): void {
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
    }
}

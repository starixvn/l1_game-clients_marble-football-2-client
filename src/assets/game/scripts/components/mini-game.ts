import { _decorator, Component, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass("MiniGame")
export class MiniGame extends Component {
    @property(sp.Skeleton)
    private home: sp.Skeleton = null;

    @property(sp.Skeleton)
    private away: sp.Skeleton = null;

    @property(sp.Skeleton)
    private statistic: sp.Skeleton = null;

    @property(sp.Skeleton)
    private game: sp.Skeleton = null;

    protected onEnable(): void {
        this.disableAllSkeletonNodes();
    }

    protected onDisable(): void {
        this.disableAllSkeletonNodes();
    }

    playStatistic() {
        this.statistic!.node.active = true;

        const statisticAnimation = "animation";

        const flagDuration = this.home.findAnimation("home").duration;
        const duration = this.statistic.findAnimation(statisticAnimation).duration - flagDuration;

        this.statistic.setAnimation(0, statisticAnimation, false);

        this.scheduleOnce(() => {
            this.home!.node.active = true;
            this.away!.node.active = true;

            this.home.setAnimation(0, "home", false);
            this.away.setAnimation(0, "away", false);
        }, duration);
    }

    playMiniGame(isHomeWin: boolean, roundId: number) {
        this.game!.node.active = true;

        const index = (roundId % 3) + 1;
        const animation = isHomeWin ? `red win ${index}` : `blue win ${index}`;

        const flagDuration = this.home.findAnimation("home").duration;
        const duration = this.game.findAnimation(animation).duration - flagDuration;

        this.game.setAnimation(0, animation, false);

        this.scheduleOnce(() => {
            this.home!.node.active = true;
            this.away!.node.active = true;

            this.home.setAnimation(0, "home", false);
            this.away.setAnimation(0, "away", false);
        }, duration);
    }

    setWinLoseLabel(isHomeWin: boolean) {
        this.home!.node.getChildByPath("result/win")!.active = isHomeWin;
        this.away!.node.getChildByPath("result/lose")!.active = isHomeWin;

        this.home!.node.getChildByPath("result/lose")!.active = !isHomeWin;
        this.away!.node.getChildByPath("result/win")!.active = !isHomeWin;
    }

    private disableAllSkeletonNodes() {
        this.home!.node.active = false;
        this.away!.node.active = false;
        this.statistic!.node.active = false;
        this.game!.node.active = false;
    }
}

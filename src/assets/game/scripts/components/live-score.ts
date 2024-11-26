import { _decorator, Component, Label, Sprite } from "cc";

const { ccclass, property } = _decorator;

@ccclass("LiveScore")
export class LiveScore extends Component {
    @property(Sprite)
    private home: Sprite = null;

    @property(Sprite)
    private away: Sprite = null;

    @property(Label)
    private time: Label = null;

    @property([Label])
    private matches: Label[] = [];

    protected onLoad(): void {
        this.setMatch(1);
    }

    setTeams(home: string, away: string) {
        const homeAtlas = this.home.spriteAtlas;
        const awayAtlas = this.away.spriteAtlas;
        const homeSpriteFrame = homeAtlas.getSpriteFrame(home);
        const awaySpriteFrame = awayAtlas.getSpriteFrame(away);

        this.home.spriteFrame = homeSpriteFrame;
        this.away.spriteFrame = awaySpriteFrame;
    }

    setMatch(match: number) {
        this.matches.forEach((label, index) => {
            label.node.active = index === match - 1;
        });
    }

    setTime(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const minutesString = minutes.toString().padStart(2, "0");
        const secondsString = seconds.toString().padStart(2, "0");

        this.time.string = `${minutesString}:${secondsString}`;
    }
}

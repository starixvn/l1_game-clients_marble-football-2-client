import { _decorator, Component, Label, Sprite } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Score")
export class Score extends Component {
    @property(Sprite)
    private homeSprite: Sprite = null;

    @property(Sprite)
    private awaySprite: Sprite = null;

    @property(Label)
    private homeLabel: Label = null;

    @property(Label)
    private awayLabel: Label = null;

    @property(Label)
    private timeLabel: Label = null;

    @property(Label)
    private matchLabel: Label = null;

    setTeams(home: string, away: string) {
        const homeAtlas = this.homeSprite.spriteAtlas;
        const awayAtlas = this.awaySprite.spriteAtlas;
        const homeSpriteFrame = homeAtlas.getSpriteFrame(home);
        const awaySpriteFrame = awayAtlas.getSpriteFrame(away);

        this.homeSprite.spriteFrame = homeSpriteFrame;
        this.awaySprite.spriteFrame = awaySpriteFrame;
    }

    setScore(home: number, away: number) {
        this.homeLabel.string = home.toString();
        this.awayLabel.string = away.toString();
    }

    setMatch(match: string) {
        this.matchLabel.string = match;
    }

    setTime(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const minutesString = minutes.toString().padStart(2, "0");
        const secondsString = seconds.toString().padStart(2, "0");

        this.timeLabel.string = `${minutesString}:${secondsString}`;
    }
}

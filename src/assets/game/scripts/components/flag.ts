import { _decorator, Component, Sprite } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Flag")
export class Flag extends Component {
    @property(Sprite)
    private icon: Sprite = null;

    setIcon(icon: string) {
        const atlas = this.icon.spriteAtlas;
        if (!atlas) {
            return;
        }
        const spriteFrame = atlas.getSpriteFrame(icon);
        spriteFrame && (this.icon.spriteFrame = spriteFrame);
    }
}

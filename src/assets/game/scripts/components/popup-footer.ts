import { _decorator, Component, Label, Sprite } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PopupFooter")
export class PopupFooter extends Component {
    @property
    private index = 0;

    @property(Label)
    private timer: Label = null;

    updateTimer(time: number) {
        this.timer.string = time.toString().padStart(2, "0");
    }

    protected onEnable(): void {
        this.renderDots();
    }

    private renderDots() {
        const dots = this.node.getChildByPath("dots");

        dots.children.forEach((child, current) => {
            const sprite = child.getComponent(Sprite);
            const isActive = current % dots.children.length === this.index;

            if (isActive) {
                sprite.spriteFrame = sprite.spriteAtlas.getSpriteFrame("dimond_dot");
            } else {
                sprite.spriteFrame = sprite.spriteAtlas.getSpriteFrame("dimond_black");
            }
        });
    }
}

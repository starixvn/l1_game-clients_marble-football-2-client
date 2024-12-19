import { _decorator, Component, UIOpacity, tween, Node, UITransform } from "cc";

const { ccclass, property } = _decorator;

@ccclass("IntroOutro")
export class IntroOutro extends Component {
    @property(UIOpacity)
    private gameBackground: UIOpacity = null;

    @property(UIOpacity)
    private field: UIOpacity = null;

    @property(Node)
    private leftPanel: Node = null;

    @property(Node)
    private rightPanel: Node = null;

    @property(Node)
    private topPanel: Node = null;

    @property(Node)
    private bottomPanel: Node = null;

    private maxOpacity = 255;

    set showGameBackground(value: boolean) {
        this.gameBackground.node.active = value;
    }

    set showField(value: boolean) {
        const fieldWidth = this.field.node.getComponent(UITransform).contentSize.width * this.field.node.scale.x;
        const fieldHeight = this.field.node.getComponent(UITransform).contentSize.height * this.field.node.scale.y;
        this.leftPanel.setPosition(-fieldWidth / 2, 0, 0);
        this.rightPanel.setPosition(fieldWidth / 2, 0, 0);
        this.topPanel.setPosition(0, fieldHeight / 2, 0);
        this.bottomPanel.setPosition(0, -fieldHeight / 2, 0);
        this.leftPanel.active = value;
        this.rightPanel.active = value;
        this.field.node.active = value;
    }

    playIntroAnimation(at = 0, duration = 2) {
        if (at >= duration || at < 0 || duration < 0) {
            return;
        }

        const percent = 1 - at / duration;

        this.gameBackground.opacity = this.maxOpacity * percent;

        tween(this.gameBackground)
            .to(duration - at, { opacity: 0 })
            .start();
    }

    playOutroAnimation(at = 0, duration = 2) {
        if (at >= duration || at < 0 || duration < 0) {
            return;
        }

        const percent = at / duration;

        this.gameBackground.opacity = this.maxOpacity * percent;

        tween(this.gameBackground)
            .to(duration - at, { opacity: this.maxOpacity })
            .start();
    }
}

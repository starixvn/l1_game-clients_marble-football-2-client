import { _decorator, Component, UIOpacity, tween } from "cc";

const { ccclass, property } = _decorator;

@ccclass("IntroOutro")
export class IntroOutro extends Component {
    @property(UIOpacity)
    private gameBackground: UIOpacity = null;

    @property(UIOpacity)
    private field: UIOpacity = null;

    protected onLoad(): void {
        this.field.opacity = 0;
        this.gameBackground.opacity = 0;
    }

    set showGameBackground(value: boolean) {
        this.gameBackground.opacity = value ? 255 : 0;
    }

    set showField(value: boolean) {
        this.field.opacity = value ? 255 : 0;
    }

    playOutroAnimation(at = 0, duration = 2) {
        if (at >= duration || at < 0 || duration < 0) {
            return;
        }

        const percent = at / duration;

        this.gameBackground.opacity = 255 * percent;

        tween(this.gameBackground)
            .to(duration - at, { opacity: 255 })
            .start();
    }
}

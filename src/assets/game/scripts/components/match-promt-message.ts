import { _decorator, Enum, Sprite, SpriteAtlas, tween, UIOpacity, v3 } from "cc";
import gc from "@sg/game-client-base";
import PromptMessageComponent from "db://shared-components/game/prompt-message/scripts/prompt-message-component";
const { ccclass, property } = _decorator;
const { Translator } = gc;

export enum IconName {
    COIN = 0,
    CUP = 1,
    HAND = 2,
    WHISTLE = 3,
}

const iconNameMap = {
    [IconName.COIN]: "icon_coin",
    [IconName.CUP]: "icon_cup",
    [IconName.HAND]: "icon_hand",
    [IconName.WHISTLE]: "icon_whistle",
};

@ccclass("MatchPromptMessage")
export class MatchPromptMessage extends PromptMessageComponent {
    _icon: IconName = IconName.CUP;

    @property({ type: Enum(IconName) })
    get icon() {
        return this._icon;
    }

    set icon(icon: IconName) {
        this._icon = icon;
        this.iconSprites.forEach((sprite, _) => {
            sprite.spriteFrame = this.iconAtlas.getSpriteFrame(iconNameMap[icon]);
        });
    }

    @property([Sprite])
    iconSprites: Sprite[] = [];

    @property(SpriteAtlas)
    iconAtlas: SpriteAtlas = null;

    prompt() {
        const opacity = this.node.getComponent(UIOpacity);
        opacity.opacity = 1;
        const clonePositionX = this.node.position.x;
        const clonePositionY = this.node.position.y;

        tween(opacity)
            .to(this.durationAnimOpacity, { opacity: 255 }, { easing: this.easingStart })
            .delay(this.durationShow - this.durationAnimOpacity * 2)
            .to(this.durationAnimOpacity, { opacity: 0 }, { easing: this.easingStart })
            .start();

        tween(this.node)
            .to(
                this.durationAnimMove,
                {
                    position: v3(0, 0, 0),
                },
                { easing: this.easingStart }
            )
            .delay(this.durationShow - this.durationAnimMove * 2)
            .to(
                this.durationAnimMove,
                {
                    position: v3(Math.abs(clonePositionX), Math.abs(clonePositionY), 0),
                },
                { easing: this.easingStart }
            )
            .delay(0.2)
            .to(0.1, {
                position: v3(clonePositionX, clonePositionY, 0),
            })
            .start();
    }

    showTimeUpMessage() {
        const message = Translator.gameTranslate("time_up").toUpperCase();
        this.icon = IconName.WHISTLE;
        this.content = message;
    }

    showStartBetMessage() {
        const message = Translator.commonTranslate("message_place_bets").toUpperCase();
        this.icon = IconName.COIN;
        this.content = message;
    }

    showStopBetMessage() {
        const message = Translator.commonTranslate("message_stop_bet").toUpperCase();
        this.icon = IconName.HAND;
        this.content = message;
    }

    showNextMatchMessage() {
        const message = Translator.gameTranslate("next_match").toUpperCase();
        this.icon = IconName.CUP;
        this.content = message;
    }
}

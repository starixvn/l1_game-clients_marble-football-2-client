import { _decorator } from "cc";
import gc from "@sg/game-client-base";
import PromptMessageComponent from "db://shared-components/game/prompt-message/scripts/prompt-message-component";
const { ccclass } = _decorator;
const { Rounds, Translator } = gc;
@ccclass("MatchPromptMessage")
export class MatchPromptMessage extends PromptMessageComponent {
    showTimeUpMessage() {
        const message = Translator.gameTranslate("time_up").toUpperCase();
        this.content = message;
    }
}

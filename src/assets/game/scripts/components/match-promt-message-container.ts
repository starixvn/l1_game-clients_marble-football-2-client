import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { PromptMessageContainer } from "db://shared-components/game/prompt-message/scripts/prompt-message-container";
import Observer from "observer";
import { settings } from "../game-settings";
import { MatchPromptMessage } from "./match-promt-message";
const { ccclass } = _decorator;
const { Rounds } = gc;
const { render } = Observer;
const NEXT_MATCH_TIME = 140;
@ccclass("MatchPromptMessageContainer")
export class MatchPromptMessageContainer extends PromptMessageContainer {
    promptMessageComponent: MatchPromptMessage;

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async showMatchMessage(time: number) {
        if (time === settings.durations.showingResult) {
            this.scheduleOnce(() => this.getComponent().showTimeUpMessage(), 0.5);
        }
        if (time === NEXT_MATCH_TIME) {
            this.scheduleOnce(() => this.getComponent().showNextMatchMessage(), 1);
        }
    }

    getComponent() {
        if (!this.promptMessageComponent) {
            const node = this.createNode();
            this.promptMessageComponent = node.getComponent(MatchPromptMessage);
        }

        return this.promptMessageComponent;
    }
}

import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { PromptMessageContainer } from "db://shared-components/game/prompt-message/scripts/prompt-message-container";
import Observer from "observer";
import { settings } from "../game-settings";
import { MatchPromptMessage } from "./match-promt-message";

const { ccclass } = _decorator;
const { Rounds } = gc;
const { render } = Observer;

const PROMPT_SOUND_ID = {
    START_BETTING: "start-betting",
    NEXT_MATCH: "next-match",
    STOP_BETTING: "stop-betting",
};

@ccclass("MatchPromptMessageContainer")
export class MatchPromptMessageContainer extends PromptMessageContainer {
    promptMessageComponent: MatchPromptMessage;

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async showMatchMessage(time: number) {
        if (time === settings.points.timeUp) {
            this.scheduleOnce(() => this.getComponent().showTimeUpMessage(), 0.5);
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.isShowStartBetMessage)
    showStartBetMessage(isStartingRound: boolean) {
        if (isStartingRound) {
            this.scheduleOnce(() => {
                this.getComponent()?.showStartBetMessage();
                this.playSound(PROMPT_SOUND_ID.START_BETTING);
            }, 1);
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartLocking)
    renderIsStartLocking(isStartLocking: boolean) {
        if (!this.shortLockingDuration && isStartLocking) {
            this.getComponent()?.showStopBetMessage();
            this.playSound(PROMPT_SOUND_ID.STOP_BETTING);
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

import { MarbleRoundTimeStore } from "./marble-round-time-store";
import { MarbleGameSetting } from "../game-configs/marble-game-setting";
import inversify from "inversify";

const { injectable, inject } = inversify;

@injectable()
export class MarbleRoundRunningHandlers {
    @inject(MarbleRoundTimeStore) protected readonly roundTimeStore: MarbleRoundTimeStore;
    @inject(MarbleGameSetting) protected readonly gameSetting: MarbleGameSetting;

    runnerId;

    startRunner() {
        this.runnerId = setInterval(() => {
            this.roundTimeStore.countdown();
        }, 1000);
    }

    stopRunner() {
        clearInterval(this.runnerId);
        this.roundTimeStore.resetRoundTimeStore();
    }
}

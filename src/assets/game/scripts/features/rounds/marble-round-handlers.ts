import gc from "@sg/game-client-base";
import inversify from "inversify";

import { MarbleRoundStore } from "./marble-round-store";

const { injectable, inject } = inversify;
const { Shared } = gc;

@injectable()
export class MarbleRoundHandlers implements gc.Shared.IMultipleHandlers {
    @inject(MarbleRoundStore) protected readonly store: MarbleRoundStore;
    constructor() {}

    handleRoundId(roundId: number) {
        if (roundId > 0) {
            this.store.roundId = roundId;
        }
    }

    eventHandleList = [
        {
            name: Shared.GameServiceMessage.roundId,
            handle: this.handleRoundId,
        },
    ];
}

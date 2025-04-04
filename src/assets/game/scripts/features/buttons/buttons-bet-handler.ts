import gc from "@sg/game-client-base";
import inversify from "inversify";
import { ButtonsBetStore } from "./buttons-bet-store";

const { injectable, inject } = inversify;

@injectable()
export class ButtonsBetHandler {
    @inject(ButtonsBetStore) private buttonsBetStore: ButtonsBetStore;

    handlePreviewBets(isPreviewBets: boolean) {
        this.buttonsBetStore.isPreviewBets = isPreviewBets;
    }
}

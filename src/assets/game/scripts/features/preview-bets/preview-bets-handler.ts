import gc from "@sg/game-client-base";
import inversify from "inversify";
import { ButtonsBetStore } from "./buttons-bet-store";
import { ChipsPreviewStore } from "./chips-preview-store";

const { injectable, inject } = inversify;

@injectable()
export class PreviewBetsHandler {
    @inject(ButtonsBetStore) private buttonsBetStore: ButtonsBetStore;
    @inject(ChipsPreviewStore) private chipsPreviewStore: ChipsPreviewStore;
    @inject(gc.Chips.ChipStore) private chipsStore: gc.Chips.ChipStore;

    handlePreviewBets(isPreviewBets: boolean) {
        this.buttonsBetStore.isPreviewBets = isPreviewBets;
        if (isPreviewBets && !this.chipsPreviewStore.boundChips) {
            this.chipsPreviewStore.chips = this.chipsStore.clientChips;
            this.chipsPreviewStore.boundChips = true;
        }
    }

    triggerBoundChips() {
        if (!this.chipsPreviewStore.boundChips) {
            this.chipsPreviewStore.finalChips = this.chipsStore.clientChips;
        }
    }
}

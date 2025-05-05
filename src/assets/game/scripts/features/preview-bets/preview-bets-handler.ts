import gc from "@sg/game-client-base";
import inversify from "inversify";
import { ButtonsBetStore } from "./buttons-bet-store";
import { ChipsPreviewStore } from "./chips-preview-store";

const { injectable, inject } = inversify;

type ChipBindingType = "firstHalf" | "secondHalf" | "final";

@injectable()
export class PreviewBetsHandler {
    @inject(ButtonsBetStore) private buttonsBetStore: ButtonsBetStore;
    @inject(ChipsPreviewStore) private chipsPreviewStore: ChipsPreviewStore;
    @inject(gc.Chips.ChipStore) private chipsStore: gc.Chips.ChipStore;
    @inject(gc.Settlements.SettlementStore) private settlementStore: gc.Settlements.SettlementStore;

    handlePreviewBets(isPreviewBets: boolean) {
        this.buttonsBetStore.isPreviewBets = isPreviewBets;
    }

    private bindChips(type: ChipBindingType) {
        const bindingMap = {
            firstHalf: {
                bound: "boundChipsFirstHalf",
                chips: "firstHalfChips",
                filter: (key: string) => !key.includes("Live"),
            },
            secondHalf: {
                bound: "boundChipsSecondHalf",
                chips: "secondHalfChips",
                filter: (key: string) => key.includes("Live"),
            },
        };

        const { bound, chips, filter } = bindingMap[type];
        if (!this.chipsPreviewStore[bound]) {
            this.chipsPreviewStore[chips] = Object.fromEntries(Object.entries(this.chipsStore.clientChips).filter(([key]) => filter(key)));
            this.chipsPreviewStore[bound] = true;
        }
    }

    triggerBoundFinalChips() {
        const chipsNeedBind = {
            ...this.chipsStore.clientChips,
        };

        if (this.chipsPreviewStore.boundChipsFirstHalf) {
            Object.keys(this.chipsStore.clientChips).forEach((key) => {
                if (!key.includes("Live")) {
                    delete chipsNeedBind[key];
                }
            });
        }
        if (this.chipsPreviewStore.boundChipsSecondHalf) {
            Object.keys(chipsNeedBind).forEach((key) => {
                if (key.includes("Live")) {
                    delete chipsNeedBind[key];
                }
            });
        }

        if (Object.keys(chipsNeedBind).length > 0) {
            this.chipsPreviewStore.finalChips = {
                chips: chipsNeedBind,
                settlementResult: this.settlementStore.settlementResult,
            };
        }
    }

    triggerBoundFirstHalfChips() {
        this.bindChips("firstHalf");
    }

    triggerBoundSecondHalfChips() {
        this.bindChips("secondHalf");
    }
}

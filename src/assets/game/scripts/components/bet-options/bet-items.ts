import { _decorator, Component, Node } from "cc";
import gc from "@sg/game-client-base";
import observer from "observer";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";

const { ccclass, property } = _decorator;
const { render } = observer;

@ccclass("BetItems")
export class BetItems extends BetItemsPolygonBase {
    @render(OddsStore, (store) => store.oddsWithConfig)
    renderOdds(oddsWithConfig: OddsWithConfig) {
        const { odds, fractional } = oddsWithConfig;
        console.log("odds", odds);
        Object.keys(odds).forEach((choice) => {
            const betItem = this.filterBetItem(choice);
            betItem?.renderOdd(odds[choice], fractional);
        });
    }
}

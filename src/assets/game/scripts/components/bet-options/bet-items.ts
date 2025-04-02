import { _decorator } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import { OddsWithConfig } from "../../features/dynamic-odds/odds-store";

const { ccclass } = _decorator;

@ccclass
export class BetItemsPolygon extends BetItemsPolygonBase {
    renderOdds(oddsWithConfig: OddsWithConfig) {
        const { odds, fractional } = oddsWithConfig;
        console.log("odds", odds);
        Object.keys(odds).forEach((choice) => {
            const betItem = this.filterBetItem(choice);
            betItem?.renderOdd(odds[choice], fractional);
        });
    }
}

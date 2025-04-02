import { _decorator } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import observer from "observer";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";

const { ccclass } = _decorator;
const { render } = observer;

@ccclass
export class BetItems extends BetItemsPolygonBase {
    @render(OddsStore, (store) => store.oddsWithConfig)
    renderOdds(oddsWithConfig: OddsWithConfig) {
        const { odds, fractional } = oddsWithConfig;
        Object.keys(odds || {}).forEach((choice) => {
            const betItem = this.filterBetItem(choice);
            betItem?.renderOdd(odds[choice], fractional);
        });
    }

    override handleResetHighlight(isResetHighlight: boolean) {}
}

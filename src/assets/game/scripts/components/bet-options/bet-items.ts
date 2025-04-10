import { _decorator } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import observer from "observer";
import gc from "@sg/game-client-base";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
import BetItemCustomize from "./bet-item-customize";

const { ccclass } = _decorator;
const { render } = observer;

@ccclass
export class BetItems extends BetItemsPolygonBase {
    @render(OddsStore, (store) => store.oddsWithConfig)
    renderOdds(oddsWithConfig: OddsWithConfig) {
        const { odds, fractional } = oddsWithConfig;
        Object.keys(odds || {}).forEach((choice) => {
            const betItem = this.filterBetItem(choice) as BetItemCustomize;
            const odd = +odds[choice];
            odd <= 0 && betItem?.blockBetOption();
            betItem?.renderOdd(odd, fractional);
        });
    }

    @render(gc.Rounds.RoundStore, (store) => store.userBetPercentage)
    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        if (!userBetPercentage) {
            return;
        }
        const preBetChoicesSum = Object.entries(userBetPercentage)
            .filter(([choice, value]) => !choice.includes("Live"))
            .reduce((acc, [choice, value]) => {
                acc += value;
                return acc;
            }, 0);
        const liveBetChoicesSum = Object.entries(userBetPercentage)
            .filter(([choice, value]) => choice.includes("Live"))
            .reduce((acc, [choice, value]) => {
                acc += value;
                return acc;
            }, 0);
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.node.name;
            const userBetPercentageSum = choice.includes("Live") ? liveBetChoicesSum : preBetChoicesSum;
            const denominator = userBetPercentageSum === 0 ? 1 : userBetPercentageSum;
            betItem.renderUserBetPercentage(Math.round((userBetPercentage[choice] / denominator) * 100));
        });
    }
}

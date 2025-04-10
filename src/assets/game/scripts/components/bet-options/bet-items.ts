import { _decorator } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import observer from "observer";
import gc from "@sg/game-client-base";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
import BetItemCustomize from "./bet-item-customize";

const { ccclass, property } = _decorator;
const { render } = observer;

@ccclass
export class BetItems extends BetItemsPolygonBase {
    @property({ type: Boolean })
    isLiveBets: boolean = false;
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

        const filterBet = this.isLiveBets ? ([choice, value]) => choice.includes("Live") : ([choice, value]) => !choice.includes("Live");
        const betChoiceSum = Object.entries(userBetPercentage)
            .filter(filterBet)
            .reduce((acc, [choice, value]) => {
                acc += value;
                return acc;
            }, 0);

        const denominator = betChoiceSum === 0 ? 1 : betChoiceSum;
        let totalPercentage = 0;
        let lastChoice = "";

        const percentageDict = Object.entries(userBetPercentage)
            .filter(filterBet)
            .reduce((acc, [choice, value]) => {
                acc[choice] = Math.round((value / denominator) * 100);
                lastChoice = choice;
                totalPercentage += acc[choice];
                return acc;
            }, {});

        percentageDict[lastChoice] = percentageDict[lastChoice] + (100 - totalPercentage);

        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.node.name;
            betItem.renderUserBetPercentage(percentageDict[choice]);
        });
    }
}

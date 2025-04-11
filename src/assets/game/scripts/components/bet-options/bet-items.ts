import { _decorator, CCBoolean, Widget } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import observer from "observer";
import gc from "@sg/game-client-base";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
import BetItemCustomize from "./bet-item-customize";

const { ccclass, property } = _decorator;
const { render } = observer;

@ccclass
export class BetItems extends BetItemsPolygonBase {
    @property(CCBoolean)
    isLiveBets: boolean = false;
    @render(OddsStore, (store) => store.oddsWithConfig)
    renderOdds(oddsWithConfig: OddsWithConfig) {
        const { odds, fractional } = oddsWithConfig;

        Object.keys(odds || {}).forEach((choice) => {
            const betItem = this.filterBetItem(choice) as BetItemCustomize;
            if (!betItem) {
                return;
            }

            const odd = +odds[choice];
            if (odd <= 0) {
                betItem.blockBetOption();
                return;
            }

            betItem.renderOdd(odd, fractional);
            this.updateWidgets(betItem);
        });
    }

    updateWidgets(betItem: BetItemCustomize) {
        const widgets = betItem.lblOdds?.getComponentsInChildren(Widget);
        if (widgets.length > 0) {
            widgets.forEach((widget) => {
                widget.updateAlignment();
            });
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.userBetPercentage)
    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        if (!userBetPercentage) {
            return;
        }

        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.node.name;
            const percentage = userBetPercentage[choice];
            betItem.renderUserBetPercentage(percentage);
        });
    }
}

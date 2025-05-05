import { _decorator, CCBoolean, Widget } from "cc";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import observer from "observer";
import gc from "@sg/game-client-base";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
import BetItemCustomize from "./bet-item-customize";
import { MarbleRoundStore } from "../../features/rounds/marble-round-store";

const { ccclass, property } = _decorator;
const { render } = observer;

@ccclass
export class BetItems extends BetItemsPolygonBase {
    @property(CCBoolean)
    isLiveBets = false;

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

    handleBetPercentage(betPercentage: gc.GameServiceMessage.BetPercentage) {}

    handleResetHighlight(isResetHighlight: boolean) {}

    @render(MarbleRoundStore, (store) => store.isResetHighlightPrevMatch)
    handleResetHighlightPrevMatch(isResetHighlightPreMatch: boolean) {
        if (isResetHighlightPreMatch && !this.isLiveBets) {
            this.clearHighlightStatic();
        }
    }

    @render(MarbleRoundStore, (store) => store.isResetHighlightLive)
    handleResetHighlightLive(isResetHighlightLive: boolean) {
        if (isResetHighlightLive && this.isLiveBets) {
            this.clearHighlightStatic();
        }
    }

    @render(gc.Rounds.RoundStore, (store) => store.userBetPercentage)
    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.node.name;
            betItem.renderUserBetPercentage(userBetPercentage?.[choice] ?? 0);
        });
    }
}

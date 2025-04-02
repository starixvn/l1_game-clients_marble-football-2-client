import { _decorator, Component, Node } from "cc";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
const { ccclass, property } = _decorator;
const { render } = Observer;
const { Rounds } = gc;

@ccclass("FinalBetItems")
export class FinalBetItems extends BetItemsPolygonBase {
    @render(Rounds.RoundStore, (store) => store.ownBets, { fireImmediately: false })
    renderOwnBets(ownBets: gc.GameServiceMessage.OwnBets) {
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.betChoice;
            const sum = ownBets[choice] || 0 + ownBets[`${choice}Live`] || 0;
            betItem.renderOwnBet(gc.FormatUtils.numberWithCommas(sum));
        });
    }

    @render(Rounds.RoundStore, (store) => store.totalBets)
    renderTotalBets(totalBets: gc.GameServiceMessage.TotalBets) {
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.betChoice;
            const sum = totalBets[choice] || 0 + totalBets[`${choice}Live`] || 0;
            betItem.renderTotalBet(gc.FormatUtils.numberWithCommas(sum));
        });
    }
}

import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import { FunctionUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
const { ccclass } = _decorator;
const { render, useObserver } = Observer;
const { Rounds } = gc;

@ccclass("BetItemsFinal")
export class BetItemsFinal extends BetItemsPolygonBase {
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

    @render(Rounds.RoundStore, (store) => store.highLightAnim, { fireImmediately: false })
    handleHighlightAnim(highLightInfo: gc.Rounds.THighlightAnim) {
        const { settlementResult, isAnim } = highLightInfo;
        if (highLightInfo?.settlementResult) {
            this.betItemComponents.forEach((betItem) => {
                const choice = betItem.node.name;
                const winPre = this.isWinning(+settlementResult?.[choice]);
                const winLive = this.isWinning(+settlementResult?.[`${choice}Live`]);
                const win = winPre || winLive;
                betItem.handleHighlightAnim(win && isAnim);
            });
        } else {
            this.clearHighlightAnim();
        }
    }

    get lostBetItems(): BetItem[] {
        return this.betItemComponents.filter(
            (item: BetItem) => !this.settlementResult?.[item.betChoice] && !this.settlementResult?.[`${item.betChoice}Live`]
        );
    }

    get winBetItems(): BetItem[] {
        return this.betItemComponents.filter(
            (item: BetItem) => this.settlementResult?.[item.betChoice] || this.settlementResult?.[`${item.betChoice}Live`]
        );
    }
}

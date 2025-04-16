import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { BetItemsPolygon as BetItemsPolygonBase } from "db://shared-components/game/bets/scripts/components/bet-items-polygon";
import Observer from "observer";
const { ccclass } = _decorator;
const { render } = Observer;
const { Rounds } = gc;

@ccclass("BetItemsFinal")
export class BetItemsFinal extends BetItemsPolygonBase {
    @render(Rounds.RoundStore, (store) => store.ownBets, { fireImmediately: false })
    renderOwnBets(ownBets: gc.GameServiceMessage.OwnBets) {}

    bindOwnBets(ownBets: gc.GameServiceMessage.OwnBets) {
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.betChoice;
            const sum = (ownBets[choice] || 0) + (ownBets[`${choice}Live`] || 0);
            betItem.renderOwnBet(sum !== 0 ? gc.FormatUtils.numberWithCommas(sum) : "");
        });
    }

    renderTotalBets(totalBets: gc.GameServiceMessage.TotalBets) {}

    bindTotalBets(totalBets: gc.GameServiceMessage.TotalBets) {
        this.betItemComponents.forEach((betItem) => {
            const choice = betItem.betChoice;
            const sum = (totalBets[choice] || 0) + (totalBets[`${choice}Live`] || 0);
            betItem.renderTotalBet(sum !== 0 ? gc.FormatUtils.numberWithCommas(sum) : "");
        });
    }

    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {}

    handleBetPercentage(betPercentage: gc.GameServiceMessage.BetPercentage) {}

    bindUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        this.init();
        this.betItemComponents.forEach((betItem) => {
            const choice = `${betItem.node.name}Final`;
            betItem.renderUserBetPercentage(userBetPercentage?.[choice] ?? 0);
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

    renderOdds(roundOdds: gc.Rounds.RoundOdds): void {}

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

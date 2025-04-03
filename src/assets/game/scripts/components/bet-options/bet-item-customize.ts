import { _decorator, Node } from "cc";
import Observer from "observer";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";

const { property, ccclass } = _decorator;
const { render } = Observer;

@ccclass
export default class BetItemCustomize extends BetItem {
    @property(Node)
    increaseOdd: Node = null;

    @property(Node)
    decreaseOdd: Node = null;

    @render(OddsStore, (store) => store.oddsWithConfig)
    renderIncreaseOdds(oddsWithConfig: OddsWithConfig) {
        const betChoice = this.betChoice;
        if (!this.isLiveBet(betChoice)) {
            this.hideOddsIndicators();
            return;
        }

        const deltaOdd = oddsWithConfig.deltaOdds[betChoice] || 0;
        this.updateOddsIndicators(deltaOdd);
    }

    private isLiveBet(betChoice: string): boolean {
        return betChoice.includes("Live");
    }

    private hideOddsIndicators(): void {
        this.increaseOdd!.active = false;
        this.decreaseOdd!.active = false;
    }

    private updateOddsIndicators(deltaOdd: number): void {
        const isIncrease = deltaOdd > 0;
        this.increaseOdd!.active = isIncrease;
        this.decreaseOdd!.active = !isIncrease;
    }
}

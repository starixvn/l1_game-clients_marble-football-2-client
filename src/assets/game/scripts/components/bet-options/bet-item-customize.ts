import { _decorator, Node } from "cc";
import Observer from "observer";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { OddsStore } from "../../features/dynamic-odds/odds-store";

const { property, ccclass } = _decorator;
const { render } = Observer;

@ccclass
export default class BetItemCustomize extends BetItem {
    @property(Node)
    increaseOdd: Node = null;

    @property(Node)
    decreaseOdd: Node = null;

    @render(OddsStore, (store) => store.oddsWithConfig)
    renderIncreaseOdds(oddsWithConfig: any) {
        const betChoice = this.betChoice;
        if (!betChoice.includes("Live")) {
            this.increaseOdd!.active = false;
            this.decreaseOdd!.active = false;
            return;
        }
        const deltaOdd = oddsWithConfig.deltaOdds[betChoice] || 0;
        if (deltaOdd > 0) {
            this.increaseOdd!.active = true;
            this.decreaseOdd!.active = false;
        } else {
            this.increaseOdd!.active = false;
            this.decreaseOdd!.active = true;
        }
    }
}

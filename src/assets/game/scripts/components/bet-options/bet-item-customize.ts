import { _decorator, Node } from "cc";
import Observer from "observer";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
import { OddsStore, OddsWithConfig } from "../../features/dynamic-odds/odds-store";
import { GamePhaseStore } from "../../features/game-phase/game-phase-store";
import { GamePhase, PhaseId } from "../../features/game-phase/game-phase-definitions";

const { property, ccclass } = _decorator;
const { render } = Observer;

@ccclass
export default class BetItemCustomize extends BetItem {
    @property(Node)
    increaseOdd: Node = null;

    @property(Node)
    decreaseOdd: Node = null;

    @property(Node)
    disableNode: Node = null;

    @property(Node)
    blockIcon: Node = null;

    onLoad(): void {
        this.setBlockIconVisibility(false);
        this.hideOddsIndicators();
        super.onLoad();
    }

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

    setDisabledVisibility(status: boolean) {
        this.disableNode && (this.disableNode.active = status);
    }

    setBlockIconVisibility(status: boolean) {
        this.blockIcon && (this.blockIcon!.active = status);
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.Halftime || phase.id === PhaseId.Tournament) {
            this.setBlockIconVisibility(false);
        }
    }

    blockBetOption() {
        this.setBlockIconVisibility(true);
        this.setDisabledVisibility(true);
        this.hideOddsIndicators();
    }
}

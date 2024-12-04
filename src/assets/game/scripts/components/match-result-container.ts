import { _decorator } from "cc";
import Observer from "observer";
import { MultipleNodeContainer } from "../../../../extensions/shared-components/assets/shared/common-components/node-container/multiple-node-container";
import { GamePhase, GamePhaseConfig } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

enum PhaseId {
    MatchWinner = "match-winner",
    MatchStatistics = "match-statistics",
}

@ccclass
export class MatchResultContainer extends MultipleNodeContainer {
    private readonly timePointTournament = settings.durations.placingBet + settings.durations.tournament;
    private readonly timePointShowMatchWinner = this.timePointTournament + settings.durations.matchWinner;
    private readonly timePointShowMatchStatistics = this.timePointShowMatchWinner + settings.durations.matchStatistics;
    onLoad() {
        super.onLoad();
        this.registerPhaseMatchWinner();
        this.registerPhaseMatchStatistics();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseMatchStatistics() {
        const config: GamePhaseConfig = {
            id: PhaseId.MatchStatistics,
            begin: this.timePointShowMatchStatistics,
            end: this.timePointShowMatchWinner + 1,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseMatchWinner() {
        const config: GamePhaseConfig = {
            id: PhaseId.MatchWinner,
            begin: this.timePointShowMatchWinner,
            end: this.timePointTournament + 1,
        };
        return config;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        this.showNode(phase.id);
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    private renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        this.clearNode(phase.id);
    }
}

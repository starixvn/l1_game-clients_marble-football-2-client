import { _decorator, Node } from "cc";
import Observer from "observer";
import { MultipleNodeContainer } from "../../../../extensions/shared-components/assets/shared/common-components/node-container/multiple-node-container";
import { GamePhase, GamePhaseConfig, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { IMatchResult, MatchResultStore } from "../features/match-result/match-result-store";
import { settings } from "../game-settings";
import { MiniGame } from "./mini-game";
import { Winner } from "./winner";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class MatchResultContainer extends MultipleNodeContainer {
    private readonly timePointTournament = settings.durations.placingBet + settings.durations.tournament;
    private readonly timePointShowMatchWinner = this.timePointTournament + settings.durations.matchWinner;
    private readonly timePointShowMatchStatistics = this.timePointShowMatchWinner + settings.durations.matchStatistics;

    private matchResult: IMatchResult = null;
    onLoad() {
        super.onLoad();
        this.registerPhaseMatchWinner();
        // this.registerPhaseMatchStatistics();
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

    @render(MatchResultStore, (store) => store.matchResult)
    renderMatchResult(matchResult: IMatchResult) {
        this.matchResult = matchResult;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        this.showNode(phase.id);

        const node = this.getNode(phase.id);
        if (phase.id === PhaseId.MatchWinner) {
            this.initForMatchWinner(node, phase.progress);
        } else if (phase.id === PhaseId.MatchStatistics) {
            this.initForMatchStatistics(node, phase.progress);
        }
    }

    initForMatchStatistics(node: Node, at: number) {
        const miniGame = node.getComponent(MiniGame);
        if (this.matchResult.miniGame) {
            miniGame.playMiniGame(this.matchResult.homeWinsOnDraw, this.matchResult.roundId, at);
        } else {
            miniGame.setScores(this.matchResult.scores);
            miniGame.playStatistic(at);
        }
    }

    initForMatchWinner(node: Node, at: number) {
        const winnerComp = node.getComponent(Winner);
        const winner = this.matchResult.winner;
        if (this.matchResult.isFinal) {
            winnerComp.playChampion(at, winner);
        } else {
            winnerComp.playWinner(at, winner);
        }
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    private renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        this.clearNode(phase.id);
    }
}

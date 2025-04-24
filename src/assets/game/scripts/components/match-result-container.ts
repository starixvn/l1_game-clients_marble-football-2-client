import { _decorator, Node } from "cc";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { MultipleNodeContainer } from "db://shared-components/shared/common-components/node-container/multiple-node-container";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { IMatchResult, MatchResultStore } from "../features/match-result/match-result-store";
import { MiniGame } from "./mini-game";
import { Winner } from "./winner";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

const WINNER_SFX = "winner";

@ccclass
export class MatchResultContainer extends MultipleNodeContainer {
    private matchResult: IMatchResult = null;

    @render(MatchResultStore, (store) => store.matchResult)
    renderMatchResult(matchResult: IMatchResult) {
        if (!matchResult) {
            return;
        }
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
            this.playSound();
        } else if (phase.id === PhaseId.MatchStatistics) {
            this.initForMatchStatistics(node, phase.progress);
        }
    }

    @handle(gc.Audios.AudioHandler, (handler, id: string) => handler.playSFX(id))
    private playSound() {
        return WINNER_SFX;
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
        const isHomeWin = this.matchResult.isHomeWin;
        const isFinal = this.matchResult.isFinal;
        winnerComp.showWinner(at, winner, isHomeWin, isFinal);
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    private renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        this.clearNode(phase.id);
    }
}

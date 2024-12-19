import { _decorator, Label, Node, sp } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { IMatchResult, MatchResultStore } from "../features/match-result/match-result-store";
import { MarbleFootballServiceMessages } from "../marble-football-service-messages";
const { ccclass, property } = _decorator;
const { render, handle } = Observer;
@ccclass("MiniGame")
export class MatchResult extends ObserverComponent {
    @property(Node)
    penaltyNode: Node = null;

    @property(Node)
    scoreFinal: Node = null;

    @property(Label)
    score1st: Label = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    private isPenalty = false;

    @render(MatchResultStore, (store) => store.matchResult)
    renderMatchResult(matchResult: IMatchResult) {
        const { miniGame, penalty, scores } = matchResult;
        this.isPenalty = miniGame;
        this.penaltyNode.active = this.isPenalty;

        if (this.isPenalty) {
            this.renderPenalty(penalty);
        }
        const firstHalftScore = scores[0];
        this.score1st.string = `${firstHalftScore[0]} - ${firstHalftScore[1]}`;

        const scoreFinal = scores[2];
        this.renderFinalScore(scoreFinal);
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        if (phase.id === PhaseId.MatchWinner) {
            this.hide().then(() => (this.node.active = false));
        }
    }

    async show(animated: boolean) {
        const animationName = this.isPenalty ? "penalty on show" : "penalty off show";

        if (!animated) {
            const entry = this.spine.setAnimation(0, animationName, false);
            entry.trackTime = entry.animationEnd;
            return;
        }
        await AnimationUtils.playSpine(this.spine, animationName, false);
    }

    async hide() {
        try {
            const animationName = this.isPenalty ? "penalty on hide" : "penalty off hide";
            await AnimationUtils.playSpine(this.spine, animationName, false);
        } catch (e) {}
    }

    renderFinalScore(scores: number[]) {
        scores.forEach((score, index) => {
            const label = this.scoreFinal.children[index].getComponent(Label);
            label.string = score.toString();
        });
    }

    renderPenalty(penalty: MarbleFootballServiceMessages.Penalty) {
        Object.keys(penalty).forEach((key) => {
            const label = this.penaltyNode.getChildByName(key).getComponent(Label);
            label.string = penalty[key].toString();
        });
    }
}

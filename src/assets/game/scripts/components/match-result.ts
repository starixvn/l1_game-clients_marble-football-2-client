import { _decorator, Label, Node } from "cc";
import Observer from "observer";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
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

    @render(MatchResultStore, (store) => store.matchResult)
    renderMatchResult(matchResult: IMatchResult) {
        const { miniGame, penalty, scores } = matchResult;

        this.penaltyNode.active = miniGame;
        if (miniGame) {
            this.renderPenalty(penalty);
        }
        const firstHalftScore = scores[0];
        this.score1st.string = `${firstHalftScore[0]} - ${firstHalftScore[1]}`;

        const scoreFinal = scores[2];
        this.renderFinalScore(scoreFinal);
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

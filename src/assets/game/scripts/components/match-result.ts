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
    @property({ type: sp.Skeleton })
    teamSpines: sp.Skeleton[] = [];

    @property(Node)
    penaltyNode: Node = null;

    @property(Node)
    scoreFinal: Node = null;

    @property(Label)
    score1st: Label = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    private isPenalty = false;

    onLoad() {
        this.node.active = false;
        super.onLoad();
    }

    @render(MatchResultStore, (store) => store.matchResult)
    renderMatchResult(matchResult: IMatchResult) {
        if (!matchResult) {
            return;
        }

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

    @render(GamePhaseStore, (store) => store.beforeEnterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        if (phase.id === PhaseId.MatchWinner) {
            const hideDuration = 0.3333;
            this.scheduleOnce(() => this.hide().then(() => (this.node.active = false)), 1 - hideDuration);
        }
    }
    async playSpine(spine: sp.Skeleton, animationName: string, animated: boolean) {
        if (!animated) {
            const entry = spine.setAnimation(0, animationName, false);
            entry.trackTime = entry.animationEnd;
            return;
        }

        await AnimationUtils.playSpine(spine, animationName, false);
    }

    async animationTeams(animated: boolean) {
        await Promise.all(
            ["home", "away"].map((team, index) => {
                const spine = this.teamSpines[index];
                return this.playSpine(spine, team, animated);
            })
        );
    }

    async show(animated: boolean) {
        try {
            this.node.active = true;
            this.spine.node.active = false;
            this.animationTeams(animated);
            await AnimationUtils.delayTime(0.33);
            this.spine.node.active = true;
            const animationName = this.isPenalty ? "penalty on show" : "penalty off show";
            await this.playSpine(this.spine, animationName, animated);
        } catch (e) {}
    }

    async hide() {
        try {
            console.log("hide match result");
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

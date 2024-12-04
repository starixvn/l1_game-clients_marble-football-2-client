import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import { Dialog } from "../../../../../extensions/shared-components/assets/shared/common-components/dialogs/dialog";
import { NodeContainer } from "../../../../../extensions/shared-components/assets/shared/common-components/node-container/node-container";
import { TournamentStore } from "../../features/tournament/tournament-store";
import { settings } from "../../game-settings";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { Tournament } from "./tournament";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class TournamentContainer extends NodeContainer {
    private tournament: MarbleFootballServiceMessages.Tournament = null;
    private isShowingTournament = false;

    @render(TournamentStore, (store) => store.tournament)
    private renderTournament(tournament: MarbleFootballServiceMessages.Tournament) {
        if (!tournament) {
            return;
        }

        this.tournament = tournament;

        this.updateTournament();
    }

    private updateTournament() {
        if (this.node.children.length === 0) {
            return;
        }
        const node = this.node.children[0];
        const tournamentCmp = node.getComponent(Tournament);
        this.tournament && tournamentCmp?.setData(this.tournament);
    }

    private showTournament() {
        if (this.isShowingTournament) {
            return;
        }
        this.isShowingTournament = true;
        const node = this.createNode();
        const tournamentCmp = node.getComponent(Tournament);
        this.tournament && tournamentCmp.setData(this.tournament);
    }

    private hideTournament() {
        if (!this.isShowingTournament) {
            return;
        }
        this.isShowingTournament = false;
        this.tournament = null;
        const node = this.node.children[0];
        if (node.isValid) {
            const dialog = node.getComponent(Dialog);
            dialog?.hide();
        }
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundTime)
    private renderRemaining(roundTime: number) {
        const tournamentTimePoint = settings.durations.placingBet + settings.durations.tournament;

        const showTournament = roundTime > settings.durations.placingBet && roundTime <= tournamentTimePoint;

        if (showTournament) {
            this.showTournament();
        } else {
            this.hideTournament();
        }
    }
}

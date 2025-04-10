import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { LazyloadNodeContainer } from "db://shared-components/shared/common-components/node-container/lazyload-node-container";
import Observer from "observer";
import { Dialog } from "db://shared-components/shared/common-components/dialogs/dialog";
import { GamePhase, GamePhaseConfig, PhaseId } from "../../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../../features/game-phase/game-phase-store";
import { TournamentStore } from "../../features/tournament/tournament-store";
import { settings } from "../../game-settings";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { Tournament } from "./tournament";

const { ccclass } = _decorator;
const { render, handle } = Observer;

const BRACKET_SHOW_SFX = "bracket-show";

@ccclass
export class TournamentContainer extends LazyloadNodeContainer {
    private tournament: MarbleFootballServiceMessages.Tournament = null;
    private isShowingTournament = false;

    private readonly delayHideTournament = 0.5;

    onLoad() {
        super.onLoad();

        this.registerPhaseTournament();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseTournament() {
        const config: GamePhaseConfig = {
            id: PhaseId.Tournament,
            begin: settings.points.placingBetPreMatch + settings.durations.tournament,
            end: settings.points.placingBetPreMatch + 1,
        };

        return config;
    }

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
        const tournamentCmp = node?.getComponent(Tournament);
        this.tournament && tournamentCmp?.setData(this.tournament);
    }

    private async showTournament() {
        if (this.isShowingTournament || !this.tournament) {
            return;
        }
        this.node.active = true;
        this.isShowingTournament = true;
        const node = await this.createNodeAsync();
        const tournamentCmp = node.getComponent(Tournament);
        if (tournamentCmp) {
            try {
                this.playSound(BRACKET_SHOW_SFX);
                await tournamentCmp.show();
                this.tournament && tournamentCmp.setData(this.tournament);
            } catch (e) {}
        }
    }

    @handle(gc.Audios.AudioHandler, (handler, id: string) => handler.playSFX(id))
    private playSound(id: string) {
        return id;
    }

    private hideTournament() {
        if (!this.isShowingTournament) {
            return;
        }

        this.node.active = false;
        this.isShowingTournament = false;
        this.tournament = null;
        const node = this.node.children[0];
        if (node?.isValid) {
            const dialog = node.getComponent(Dialog);
            dialog?.hide();
        }
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        const isPhaseTournament = phase.id === PhaseId.Tournament;

        if (isPhaseTournament) {
            this.showTournament();
        }
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    private renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        const isPhaseTournament = phase.id === PhaseId.Tournament;

        if (isPhaseTournament) {
            this.scheduleOnce(() => {
                this.hideTournament();
            }, this.delayHideTournament);
        }
    }
}

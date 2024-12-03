import { _decorator } from "cc";
import Observer from "observer";
import { Dialog } from "../../../../../extensions/shared-components/assets/shared/common-components/dialogs/dialog";
import { NodeContainer } from "../../../../../extensions/shared-components/assets/shared/common-components/node-container/node-container";
import { TournamentStore } from "../../features/tournament/tournament-store";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { Tournament } from "./tournament";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class TournamentContainer extends NodeContainer {
    private readonly SHOW_DURATION = 5;

    @render(TournamentStore, (store) => store.tournament)
    private renderTournament(tournament: MarbleFootballServiceMessages.Tournament) {
        if (!tournament) {
            return;
        }
        const node = this.createNode();
        const tournamentCmp = node.getComponent(Tournament);
        tournamentCmp.setData(tournament);

        this.scheduleOnce(() => {
            const dialog = node.getComponent(Dialog);
            dialog?.hide();
        }, this.SHOW_DURATION);
    }
}

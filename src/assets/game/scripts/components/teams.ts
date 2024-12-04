import { _decorator } from "cc";
import { Flag } from "./flag";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TournamentStore } from "../features/tournament/tournament-store";
import { MarbleFootballServiceMessages } from "../marble-football-service-messages";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("Teams")
export class Teams extends ObserverComponent {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @render(TournamentStore, (store) => store.currentMatch)
    setTeams(currentMatch: MarbleFootballServiceMessages.MatchType) {
        if (currentMatch && currentMatch.home && currentMatch.away) {
            this.home.setIcon(currentMatch.home);
            this.away.setIcon(currentMatch.away);
        }
    }
}

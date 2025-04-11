import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TournamentStore } from "../features/tournament/tournament-store";
import { MarbleFootballServiceMessages } from "../marble-football-service-messages";
import { Flag } from "./flag";
import { TeamName } from "./team-name";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("Teams")
export class Teams extends ObserverComponent {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @property(TeamName)
    private homeName: TeamName = null;

    @property(TeamName)
    private awayName: TeamName = null;

    @property(Label)
    private homeCode: Label = null;

    @property(Label)
    private awayCode: Label = null;

    @render(TournamentStore, (store) => store.currentMatch)
    setTeams(currentMatch: MarbleFootballServiceMessages.MatchType) {
        if (currentMatch && currentMatch.home && currentMatch.away) {
            this.home?.setIcon(currentMatch.home);
            this.away?.setIcon(currentMatch.away);
            this.homeName?.setName(currentMatch.home);
            this.awayName?.setName(currentMatch.away);
            this.homeCode && (this.homeCode!.string = currentMatch.home);
            this.awayCode && (this.awayCode!.string = currentMatch.away);
        }
    }
}

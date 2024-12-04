import { _decorator } from "cc";
import { Flag } from "./flag";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TournamentStore } from "../features/tournament/tournament-store";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("Teams")
export class Teams extends ObserverComponent {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @render(TournamentStore, (store) => store.currentMatch.home)
    setHome(home: string) {
        this.home.setIcon(home);
    }

    @render(TournamentStore, (store) => store.currentMatch.away)
    setAway(away: string) {
        this.away.setIcon(away);
    }
}

import { _decorator, Component, sp } from "cc";
import { Flag } from "db://assets/game/scripts/components/flag";
import { TeamName } from "db://assets/game/scripts/components/team-name";
const { ccclass, property } = _decorator;

@ccclass("TournamentTeam")
export class TournamentTeam extends Component {
    @property(Flag)
    flag: Flag = null;

    @property(TeamName)
    teamName: TeamName = null;

    setAnimation(animation: string) {
        const spine = this.getComponentsInChildren(sp.Skeleton)[0];
        if (spine) {
            spine.premultipliedAlpha = animation === "out";
            spine.setAnimation(0, animation, false);
        }
    }

    setName(shortName: string) {
        this.flag.setIcon(shortName);
        this.teamName.setName(shortName);
    }
}

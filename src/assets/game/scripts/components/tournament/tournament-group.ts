import { _decorator, Component } from "cc";
import { TournamentGroupRound } from "./tournament-definitions";
import { TournamentTeam } from "./tournament-team";
const { ccclass, property } = _decorator;

@ccclass("TournamentGroup")
export class TournamentGroup extends Component {
    setRound(roundId: number) {
        for (let i = 0; i < 3; i++) {
            this.node.getChildByName(`round-${i}`).active = i > roundId;
        }
    }

    setMatches(roundId: number, groupRound: TournamentGroupRound) {
        this.setRound(roundId);

        const teams = this.getComponentsInChildren(TournamentTeam);
        const matches = groupRound[roundId];
        const matchesLength = matches.length;

        const teamNames = matches.reduce((result, current) => {
            return [...result, current.home, current.away];
        }, []);

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            team.node.active = i < matchesLength;

            if (i >= matchesLength) {
                continue;
            }

            const name = teamNames[i];
            team.setName("ARS");
            team.setAnimation("normal");
        }
    }
}

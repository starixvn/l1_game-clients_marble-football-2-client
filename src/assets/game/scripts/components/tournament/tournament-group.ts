import { _decorator, Component } from "cc";
import { TournamentGroupRound, TournamentMatch } from "./tournament-definitions";
import { TournamentTeam } from "./tournament-team";
const { ccclass, property } = _decorator;

@ccclass("TournamentGroup")
export class TournamentGroup extends Component {
    setRound(roundId: number) {
        for (let i = 0; i < 3; i++) {
            this.node.getChildByName(`round-${i}`).active = i >= roundId;
        }
    }

    setMatches(roundId: number, groupRound: TournamentGroupRound, currentMatch: TournamentMatch) {
        this.setRound(roundId);

        const teams = this.getComponentsInChildren(TournamentTeam);
        const matches = groupRound[roundId];

        const teamNames = matches
            .reduce((result, current) => {
                return [...result, current.home, current.away];
            }, [])
            .filter((name) => name !== null);
        const teamNamesLength = teamNames.length;

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            team.node.active = i < teamNamesLength;

            if (i >= teamNamesLength) {
                continue;
            }

            const name = teamNames[i];

            // team.setName(name);
            team.setName("ARS");
            const isCurrentMatch = currentMatch.home === name || currentMatch.away === name;
            team.setAnimation(isCurrentMatch ? "highlight" : "normal");
        }
    }
}

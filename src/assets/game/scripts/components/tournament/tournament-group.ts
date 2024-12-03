import { _decorator, Component } from "cc";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { TournamentGroupRound } from "./tournament-definitions";
import { TournamentTeam } from "./tournament-team";

const { ccclass, property } = _decorator;

@ccclass("TournamentGroup")
export class TournamentGroup extends Component {
    setRound(roundId: number) {
        for (let i = 0; i < 3; i++) {
            this.node.getChildByName(`round-${i}`).active = i >= roundId;
        }
    }

    setMatches(roundId: number, groupRound: TournamentGroupRound, currentMatch: MarbleFootballServiceMessages.MatchType) {
        this.setRound(roundId);

        const teams = this.getComponentsInChildren(TournamentTeam);
        const matches = groupRound[roundId];

        const teamNames = matches
            .reduce((result, current) => {
                return [
                    ...result,
                    {
                        name: current.home,
                        isWin: current.homeWins ?? true,
                    },
                    {
                        name: current.away,
                        isWin: !current.homeWins,
                    },
                ];
            }, [])
            .filter((name) => name !== null);
        const teamNamesLength = teamNames.length;

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            team.node.active = i < teamNamesLength;

            if (i >= teamNamesLength) {
                continue;
            }

            const { name, isWin } = teamNames[i];

            team.setName(name);
            const isCurrentMatch = currentMatch.home === name || currentMatch.away === name;
            const animation = isCurrentMatch ? "highlight" : isWin ? "normal" : "out";
            team.setAnimation(animation);
        }
    }
}

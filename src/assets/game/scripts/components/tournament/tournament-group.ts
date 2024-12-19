import { _decorator, Component } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { TournamentGroupRound } from "./tournament-definitions";
import { TournamentTeam } from "./tournament-team";

const { ccclass, property } = _decorator;

@ccclass("TournamentGroup")
export class TournamentGroup extends Component {
    private readonly teams: TournamentTeam[] = [];

    onLoad() {
        this.teams.push(...this.getComponentsInChildren(TournamentTeam));

        this.setRound(3);
        this.teams.forEach((team) => (team.node.active = false));
    }

    setRound(roundId: number) {
        for (let i = 0; i < 3; i++) {
            this.node.getChildByName(`round-${i}`).active = i >= roundId;
        }
    }

    async setMatches(roundId: number, groupRound: TournamentGroupRound, currentMatch: MarbleFootballServiceMessages.MatchType) {
        this.setRound(roundId);

        const teams = this.teams;
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
            .filter((team) => !!team.name);
        const teamNamesLength = teamNames.length;

        teams.forEach((team) => (team.node.active = false));

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            team.node.active = i < teamNamesLength;

            if (i >= teamNamesLength) {
                break;
            }

            const { name, isWin } = teamNames[i];

            team.setName(name);
            const isCurrentMatch = currentMatch.home === name || currentMatch.away === name;
            const animation = isCurrentMatch ? "highlight" : isWin ? "normal" : "out";
            team.setAnimation(animation);
            await AnimationUtils.delayTime(0);
        }
    }
}

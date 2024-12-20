import { _decorator, Animation, Component, Node } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import LocalizedLabelWithFormat from "../../../../../extensions/i18n/assets/LocalizedLabelWithFormat";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { TournamentGroupRound } from "./tournament-definitions";
import { TournamentGroup } from "./tournament-group";
const { ccclass, property } = _decorator;

enum RoundStartMatch {
    ROUND_1 = 8,
    ROUND_2 = 12,
    ROUND_3 = 14,
}

@ccclass("Tournament")
export class Tournament extends Component {
    @property(Animation)
    animation: Animation = null;

    @property(Node)
    content: Node = null;

    @property(LocalizedLabelWithFormat)
    labelTitle: LocalizedLabelWithFormat = null;

    @property({ type: TournamentGroup })
    groups: TournamentGroup[] = [];

    private getTitleKey(roundId: number) {
        const keys = ["tournament_round_of_16", "tournament_quarter_final", "tournament_semi_final", "tournament_final"];
        return `MarbleFootball.${keys[roundId]}`;
    }

    async show() {
        try {
            this.content.active = false;
            this.labelTitle.node.active = false;
            this.animation.play();
            await AnimationUtils.delayTime(this.animation.defaultClip.duration);
            this.content.active = true;
        } catch (e) {
            this.content.active = false;
        }
    }

    setData(tournament: MarbleFootballServiceMessages.Tournament) {
        const data = tournament;
        this.labelTitle.node.active = true;
        const roundId = this.calculateRoundId(data.currentMatch);
        this.labelTitle.setKey(this.getTitleKey(roundId));

        const currentMatch = data.matches[data.currentMatch];
        const matches = this.calculateGroup(data.matches);
        this.groups.forEach((g, index) => {
            g.setMatches(roundId, matches[index], currentMatch);
        });
    }

    calculateRoundId(currentMatch: number) {
        if (currentMatch < RoundStartMatch.ROUND_1) {
            return 0;
        }
        if (currentMatch < RoundStartMatch.ROUND_2) {
            return 1;
        }
        if (currentMatch < RoundStartMatch.ROUND_3) {
            return 2;
        }
        return 3;
    }

    calculateGroup(matches: MarbleFootballServiceMessages.MatchType[]) {
        const counts = [4, 2, 1];
        const group1: TournamentGroupRound = {};
        const group2: TournamentGroupRound = {};
        const groups = [group1, group2];
        let matchIndex = 0;
        counts.forEach((count, roundId) => {
            groups.forEach((group) => {
                group[roundId] = [];
                for (let i = 0; i < count; i++) {
                    group[roundId].push(matches[matchIndex]);
                    matchIndex++;
                }
            });
        });

        const lastRound = counts.length;
        const lastMatch = matches[matchIndex];
        groups.forEach((group, index) => {
            group[lastRound] = [
                {
                    home: index === 0 ? lastMatch.home : lastMatch.away,
                    away: null,
                },
            ];
        });

        return groups;
    }
}

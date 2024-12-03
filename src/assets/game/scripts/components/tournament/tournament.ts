import { _decorator, Component } from "cc";
import LocalizedLabelWithFormat from "../../../../../extensions/i18n/assets/LocalizedLabelWithFormat";
import { TournamentGroupRound, TournamentInfo, TournamentMatch } from "./tournament-definitions";
import { TournamentGroup } from "./tournament-group";
const { ccclass, property } = _decorator;

enum RoundStartMatch {
    ROUND_1 = 8,
    ROUND_2 = 12,
    ROUND_3 = 14,
}

@ccclass("Tournament")
export class Tournament extends Component {
    @property(LocalizedLabelWithFormat)
    labelTitle: LocalizedLabelWithFormat = null;

    @property({ type: TournamentGroup })
    groups: TournamentGroup[] = [];

    test = {
        _id: "674d67f79ad37b889bf449aa",
        matches: [
            {
                home: "BRN",
                away: "JPN",
                id: 33640,
            },
            {
                home: "CHN",
                away: "KOR",
                id: 33641,
            },
            {
                home: "HKG",
                away: "THA",
                id: 33642,
            },
            {
                home: "VNM",
                away: "SGP",
                id: 33643,
            },
            {
                home: "LAO",
                away: "PHL",
                id: 33644,
            },
            {
                home: "TLS",
                away: "IND",
                id: 33645,
            },
            {
                home: "MYS",
                away: "KHM",
                id: 33646,
            },
            {
                home: "IDN",
                away: "TWN",
                id: 33647,
            },
            {
                home: "BRN",
                away: "CHN",
                id: 33648,
            },
            {
                home: "HKG",
                away: "SGP",
                id: 33649,
            },
            {
                home: "PHL",
                away: "TLS",
                id: 33650,
            },
            {
                home: "MYS",
                away: "TWN",
                id: 33651,
            },
            {
                home: "BRN",
                away: "SGP",
                id: 33652,
            },
            {
                home: "TLS",
                away: "TWN",
            },
            {
                home: "SGP",
                away: "",
            },
        ],
        currentMatch: 13,
        ended: false,
        code: "SEAOC",
        time: "2024-12-02T07:55:35.019Z",
        __v: 0,
    };

    private getTitleKey(roundId: number) {
        const keys = ["tournament_round_of_16", "tournament_quarter_final", "tournament_semi_final", "tournament_final"];
        return `MarbleFootball.${keys[roundId]}`;
    }

    onLoad() {
        this.setData(this.test);
    }

    setData(tournament: TournamentInfo) {
        // const data = tournament;
        const data = { ...this.test, ...tournament };
        const roundId = this.calculateRoundId(data.currentMatch);
        this.labelTitle.key = this.getTitleKey(roundId);

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

    calculateGroup(matches: TournamentMatch[]) {
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

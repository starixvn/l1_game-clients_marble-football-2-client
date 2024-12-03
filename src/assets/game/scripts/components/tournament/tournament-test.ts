import { _decorator, Component, Label } from "cc";
import { Tournament } from "./tournament";
const { ccclass, property } = _decorator;

@ccclass("tournament_test")
export class tournament_test extends Component {
    @property(Label)
    label: Label = null;

    @property(Tournament)
    tournament: Tournament = null;

    matchId = 0;

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

    onLoad() {
        this.newMethod();
    }

    onClickMatch() {
        this.matchId++;
        this.newMethod();
    }

    private newMethod() {
        this.label.string = `Match ${this.matchId}`;
        this.tournament.setData({
            ...this.test,
            currentMatch: this.matchId,
        });
    }
}

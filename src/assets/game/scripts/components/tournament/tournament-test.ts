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
            currentMatch: this.matchId,
        });
    }
}

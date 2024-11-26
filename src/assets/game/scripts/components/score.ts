import { _decorator, Component, Label } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Score")
export class Score extends Component {
    @property(Label)
    private home: Label = null;

    @property(Label)
    private away: Label = null;

    onLoad() {
        this.home.string = "0";
        this.away.string = "0";

        // Randomly update the score every second
        // TODO: Remove this
        this.schedule(() => {
            const home = Math.floor(Math.random() * 10);
            const away = Math.floor(Math.random() * 10);

            this.setHome(home);
            this.setAway(away);
        }, 1);
    }

    setHome(home: number) {
        this.home.string = home.toString();
    }

    setAway(away: number) {
        this.away.string = away.toString();
    }
}

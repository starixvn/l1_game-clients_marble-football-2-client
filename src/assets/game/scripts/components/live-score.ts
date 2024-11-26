import { _decorator, Component, Label } from "cc";
import { Flag } from "./flag";

const { ccclass, property } = _decorator;

@ccclass("LiveScore")
export class LiveScore extends Component {
    @property(Flag)
    private home: Flag = null;

    @property(Flag)
    private away: Flag = null;

    @property(Label)
    private time: Label = null;

    @property([Label])
    private matches: Label[] = [];

    protected onLoad(): void {
        this.setMatch(1);

        // TODO: Remove this
        // Randomly update the flags every second
        this.schedule(() => {
            const flags = ["MCI", "RMA", "BAR", "LIV", "ARS", "FCB", "INT", "LEV", "AVL", "ATA", "BVB", "JUV", "PSG", "SCP", "ATM", "MIL"];

            this.setTeams(flags[Math.floor(Math.random() * flags.length)], flags[Math.floor(Math.random() * flags.length)]);
        }, 1);
    }

    setTeams(home: string, away: string) {
        this.home.setIcon(home);
        this.away.setIcon(away);
    }

    setMatch(match: number) {
        this.matches.forEach((label, index) => {
            label.node.active = index === match - 1;
        });
    }

    setTime(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const minutesString = minutes.toString().padStart(2, "0");
        const secondsString = seconds.toString().padStart(2, "0");

        this.time.string = `${minutesString}:${secondsString}`;
    }
}

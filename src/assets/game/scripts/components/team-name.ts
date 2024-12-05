import { _decorator, Component } from "cc";

const { ccclass } = _decorator;

@ccclass("TeamName")
export class TeamName extends Component {
    setName(shortName: string) {
        const label = this.getComponent("LocalizedLabel") as any;
        if (label) {
            label.setKey(`MarbleFootball.team_${shortName}`);
        }
    }
}

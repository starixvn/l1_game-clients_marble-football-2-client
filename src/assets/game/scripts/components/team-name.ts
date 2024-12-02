import { _decorator, Component } from "cc";
import LocalizedLabelWithFormat from "../../../../extensions/i18n/assets/LocalizedLabelWithFormat";

const { ccclass, property } = _decorator;

@ccclass("TeamName")
export class TeamName extends Component {
    setName(shortName: string) {
        const label = this.getComponent(LocalizedLabelWithFormat);
        if (label) {
            label.key = `MarbleFootball.team_${shortName}`;
        }
    }
}

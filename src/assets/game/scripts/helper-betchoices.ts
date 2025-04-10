import { _decorator, Component, instantiate, Node, sp, v3 } from "cc";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";
const { ccclass, property } = _decorator;

@ccclass("HelperBetChoices")
export class HelperBetChoices extends Component {
    @property(Node)
    container: Node = null;

    @property({
        visible: function (this: HelperBetChoices) {
            return !this.disableHighlightAnimation;
        },
        type: Node,
    })
    sample: Node = null;

    @property
    disableHighlightAnimation = false;

    onLoad(): void {
        this.generate();
    }

    private setupHighlightAnimation(betItem: BetItem, childNode: Node): void {
        if (!this.sample) {
            return;
        }

        const node = instantiate(this.sample);
        node.active = true;
        childNode.addChild(node);
        node.worldPosition = this.sample.worldPosition;

        const revert = ["home", "over", "under"].includes(betItem.node.name) ? -1 : 1;
        node.setScale(v3(node.scale.x * revert, node.scale.y, node.scale.z));

        const spine = node.getComponent(sp.Skeleton);
        const cleanName = betItem.node.name.replace(/(Live)/, "").toLowerCase();
        const nodeName = `${cleanName} win`;
        node.name = nodeName;
        spine.setAnimation(0, nodeName, true);
    }

    private processBetItem(betItem: BetItem, type: string): void {
        const parentNode = this.container.getChildByName(type);
        const childNode = parentNode.getChildByName(betItem.node.name);

        if (type === "highlight") {
            this.setupHighlightAnimation(betItem, childNode);
        }

        if (type === "static") {
            betItem.highlightStatic = childNode;
        } else if (type === "highlight") {
            betItem.highlightAnim = childNode;
        }
    }

    generate() {
        if (!this.container) {
            return;
        }

        const betItems = this.getComponentsInChildren(BetItem);
        const types = this.disableHighlightAnimation ? ["static"] : ["static", "highlight"];

        types.forEach((type) => {
            betItems.forEach((betItem) => {
                this.processBetItem(betItem, type);
            });
        });
    }
}

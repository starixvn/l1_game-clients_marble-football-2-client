import gc from "@sg/game-client-base";
import { Label, Node, UITransform, _decorator } from "cc";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render, handle } = Observer;

@ccclass
export class DrawOdds extends ObserverComponent {
    @property(Label)
    lblOdds: Label = null;

    @property(Label)
    lblSign: Label = null;

    @property(Node)
    lblTextStatic: Node = null;

    onLoad() {
        this.setLabelsVisible(false);
        super.onLoad();
    }

    setLabelsVisible(visible: boolean) {
        this.lblOdds && (this.lblOdds.node.active = visible);
        this.lblSign && (this.lblSign.node.active = visible);
        this.lblTextStatic && (this.lblTextStatic.active = visible);
    }

    @render(Rounds.RoundStore, (store) => store.roundOdds)
    renderOdds(roundOdds: gc.Rounds.RoundOdds) {
        const { odds, fractional } = roundOdds;
        const choice = this.node.name;
        const choiceOdd = odds[choice];
        if (choiceOdd) {
            this.setLabelsVisible(true);
            this.lblOdds && (this.lblOdds.string = gc.FormatUtils.formatOdds(choiceOdd, fractional));
            this.updateLayoutOdd();
        }
    }

    updateLayoutOdd() {
        this.lblOdds?.updateRenderData();
        const widthNode = this.node.getParent().getComponent(UITransform).width;
        const widthTextStatic = this.lblTextStatic.getComponent(UITransform).width;
        const widthOdds = this.lblOdds.getComponent(UITransform).width;
        const padding = 4;
        const widthSign = widthNode - widthTextStatic - widthOdds - padding;
        const numberSign = Math.floor(widthSign / 8);

        this.lblSign.string = "";
        for (let i = 0; i < numberSign; i++) {
            this.lblSign.string += ".";
        }
    }
}

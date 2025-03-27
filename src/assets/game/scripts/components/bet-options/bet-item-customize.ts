import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import Observer from "observer";
import BetItem from "db://shared-components/game/bets/scripts/components/bet-item";

const { handle, render } = Observer;
const { property, ccclass } = _decorator;
const { GameConfigs } = gc;

@ccclass
export default class BetItemCustomize extends BetItem {
    @property(Node)
    increaseOdd: Node = null;

    @property(Node)
    decreaseOdd: Node = null;
}

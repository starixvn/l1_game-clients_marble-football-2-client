import { _decorator, Component, Node } from "cc";

const { ccclass, property } = _decorator;

@ccclass("ScoreboardManager")
export class ScoreboardManager extends Component {
    @property([Node])
    private boards: Node[] = [];

    private boardIndex: number = 0;

    protected onLoad(): void {
        this.boards.forEach((board) => {
            board.active = false;
        });

        this.boards[this.boardIndex].active = true;
    }

    private next() {
        this.boards[this.boardIndex].active = false;
        this.boardIndex = (this.boardIndex + 1) % this.boards.length;
        this.boards[this.boardIndex].active = true;
    }

    private prev() {
        this.boards[this.boardIndex].active = false;
        this.boardIndex = (this.boardIndex - 1 + this.boards.length) % this.boards.length;
        this.boards[this.boardIndex].active = true;
    }
}

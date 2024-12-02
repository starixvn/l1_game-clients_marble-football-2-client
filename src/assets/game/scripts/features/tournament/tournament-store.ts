import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";

const { injectable } = inversify;

@injectable()
export class TournamentStore {
    private _tournament: MarbleFootballServiceMessages.Tournament = {} as any;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    get tournament() {
        return this._tournament;
    }

    set tournament(value: MarbleFootballServiceMessages.Tournament) {
        this._tournament = value;
    }
}

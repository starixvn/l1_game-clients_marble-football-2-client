import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";

const { injectable } = inversify;

@injectable()
export class TournamentStore {
    private _tournament: MarbleFootballServiceMessages.Tournament = null;
    private _currentMatch: MarbleFootballServiceMessages.MatchType = null;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    get tournament() {
        return this._tournament;
    }

    get currentMatch() {
        return this._currentMatch;
    }

    set tournament(value: MarbleFootballServiceMessages.Tournament) {
        this._tournament = value;
        this._currentMatch = value.matches[value.currentMatch];
    }
}

import gc from "@sg/game-client-base";
import { IMultipleHandlers } from "@sg/game-client-base/dist/shared";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { OddsStore } from "./odds-store";

const { injectable, inject } = inversify;

@injectable()
export class OddsHandler implements gc.Shared.IHandler<Record<string, number>> {
    @inject(OddsStore) private oddsStore: OddsStore;
    name = gc.Shared.GameServiceMessage.GameOdds.eventName;
    handle(input: Record<string, number>) {
        this.oddsStore.odds = input;
    }
}

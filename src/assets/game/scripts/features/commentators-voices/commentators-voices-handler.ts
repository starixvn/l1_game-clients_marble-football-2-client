import gc from "@sg/game-client-base";
import inversify from "inversify";
import { CommentatorsVoicesStore, IVoices } from "./commentators-voices-store";

const { injectable, inject } = inversify;

@injectable()
export class CommentatorsVoicesHandler implements gc.Shared.IHandler<Record<string, number>> {
    @inject(CommentatorsVoicesStore) private store: CommentatorsVoicesStore;
    name = "voices";

    handle(input: IVoices) {
        this.store.voices = input;
    }

    handleResetLoadedSounds() {
        this.store.resetLoadedSounds();
    }

    handleLoadAllSounds() {
        this.store.loadAllSounds();
    }
}

import gc from "@sg/game-client-base";
import inversify from "inversify";
import { CommentatorsVoicesStore, IVoices } from "./commentators-voices-store";
import { VideoStreamStore } from "../video-stream/video-stream-store";
import mobx from "mobx";

const { injectable, inject } = inversify;

@injectable()
export class CommentatorsVoicesHandler implements gc.Shared.IHandler<IVoices> {
    @inject(CommentatorsVoicesStore) private store: CommentatorsVoicesStore;
    @inject(VideoStreamStore) protected readonly videoStreamStore: VideoStreamStore;
    name = "voices";

    constructor() {
        setTimeout(() => {
            mobx.reaction(
                () => this.videoStreamStore.isPlayVideo,
                (isPlayVideo) => {
                    if (isPlayVideo) {
                        this.store.loadVoices();
                    }
                }
            );
        }, 0);
    }

    handle(input: IVoices) {
        if (input && Object.keys(input).length > 0) {
            this.store.voices = input;
        }
    }

    handleLoadVoices() {
        this.store.loadVoices();
    }
}

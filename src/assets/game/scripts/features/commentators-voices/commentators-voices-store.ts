import inversify from "inversify";
import mobx from "mobx";
import { AudioUtils } from "db://shared-components/game/audios/utils";
import { VideoStreamStore } from "../video-stream/video-stream-store";
import { MarbleRoundTimeStore } from "../rounds/marble-round-time-store";

const { injectable, inject } = inversify;

export interface IVoices {
    timeLine: number[];
    sounds: string[];
}

export interface ICurrentSoundPlay {
    isPlay: boolean;
    soundId?: string;
}

@injectable()
export class CommentatorsVoicesStore {
    @inject(VideoStreamStore) protected readonly videoStreamStore: VideoStreamStore;
    @inject(MarbleRoundTimeStore) protected readonly marbleRoundTimeStore: MarbleRoundTimeStore;

    private _loadedSounds = mobx.observable.map<string, { isLoaded: boolean; duration: number }>();

    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _voices: IVoices = {
        timeLine: [5, 10, 20],
        sounds: ["goal_1_1", "goal_1_2", "goal_2_1"],
    };

    get voices() {
        return this._voices;
    }

    set voices(voices: IVoices) {
        this._voices = voices;
        !this.videoStreamStore.isPlayVideo && this.loadAllSounds();
    }

    async loadAllSounds() {
        if (this._loadedSounds.size > 0) {
            console.log("CommentatorsVoicesStore-----: loadAllSounds: already loaded");
            return;
        }

        const soundsToLoad: string[] = this.voices.sounds ?? [];

        await Promise.all(soundsToLoad.map((sound) => this.loadSoundResultBeforeRead(sound)));
    }

    get loadedSounds() {
        return this._loadedSounds;
    }

    isSoundLoaded(soundKey: string): boolean {
        return this._loadedSounds.get(soundKey)?.isLoaded ?? false;
    }

    markSoundAsLoaded(soundKey: string, duration: number = 0) {
        this._loadedSounds.set(soundKey, { isLoaded: true, duration });
    }

    resetLoadedSounds() {
        this._loadedSounds.clear();
    }

    private async loadSoundResultBeforeRead(soundId: string) {
        if (!soundId || this.isSoundLoaded(soundId)) {
            return;
        }

        let isCancelLoadSound = false;
        const maxWaitTime = 3000;

        const timeoutCancelSound = setTimeout(() => {
            isCancelLoadSound = true;
        }, maxWaitTime);

        try {
            const duration = await AudioUtils.getDurationClip(soundId);
            if (duration > 0 && !isCancelLoadSound) {
                this.markSoundAsLoaded(soundId, duration);
            }
        } finally {
            timeoutCancelSound && clearTimeout(timeoutCancelSound);
        }
    }

    get currentSoundToPlay(): ICurrentSoundPlay {
        const currentTime = Math.ceil(this.videoStreamStore.currentVideoTime);

        const checkAndGetSound = (timeLine: number[], sounds: string[]) => {
            if (!timeLine || !sounds) {
                return null;
            }

            const index = timeLine.findIndex((time) => time === currentTime);
            if (index !== -1) {
                const soundId = sounds[index];
                if (this.isSoundLoaded(soundId)) {
                    return soundId;
                }
            }
            return null;
        };

        const soundId = checkAndGetSound(this._voices.timeLine, this._voices.sounds);

        return {
            isPlay: !!soundId,
            soundId: soundId,
        };
    }
}

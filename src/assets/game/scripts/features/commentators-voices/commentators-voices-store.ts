import inversify from "inversify";
import mobx from "mobx";
import { AudioUtils } from "db://shared-components/game/audios/utils";
import { VideoStreamStore } from "../video-stream/video-stream-store";
import { MarbleRoundTimeStore } from "../rounds/marble-round-time-store";
import { audioManager } from "db://shared-components/game/audios/scripts/audio-manager";
import { FunctionUtils } from "db://shared-components/shared/utils";

const { injectable, inject } = inversify;

export interface IVoices {
    timeline: number[];
    voice: string[];
}

export interface ICurrentSoundPlay {
    isPlay: boolean;
    soundId?: string;
}

interface ILoadedSound {
    isLoaded: boolean;
    duration: number;
}

@injectable()
export class CommentatorsVoicesStore {
    @inject(VideoStreamStore) protected readonly videoStreamStore: VideoStreamStore;
    @inject(MarbleRoundTimeStore) protected readonly marbleRoundTimeStore: MarbleRoundTimeStore;

    private _loadedSounds: Record<string, ILoadedSound> = {};

    constructor() {
        mobx.makeAutoObservable(this);
    }

    MAX_WAIT_TIME_LOAD_SOUND = 5000;

    private _voices: IVoices = null;

    get voices() {
        return this._voices;
    }

    set voices(voices: IVoices) {
        this._voices = voices;
        !this.videoStreamStore.isPlayVideo && this.loadVoices();
    }

    async loadVoices() {
        const voicesNeedLoad = this.voices?.voice ? this.voices.voice.filter((sound) => !this.isSoundLoaded(sound)) : [];
        if (voicesNeedLoad.length <= 0) {
            return;
        }

        await FunctionUtils.waitUntil(
            () => audioManager.audioConfigs != null && Object.keys(audioManager.audioConfigs).length > 0,
            100,
            this.MAX_WAIT_TIME_LOAD_SOUND
        );

        await Promise.all(voicesNeedLoad.map((sound) => this.loadSoundResultBeforeRead(sound)));
    }

    isSoundLoaded(soundKey: string): boolean {
        return this._loadedSounds[soundKey]?.isLoaded ?? false;
    }

    markSoundAsLoaded(soundKey: string, duration = 0) {
        this._loadedSounds[soundKey] = { isLoaded: true, duration };
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

    private findMatchingVoiceIndex(currentTime: number): number {
        const timeline = this._voices?.timeline;
        if (!timeline) {
            return -1;
        }

        return timeline.findIndex((time) => Math.ceil(time) === currentTime);
    }

    private getSoundIdByIndex(index: number): string | null {
        const voices = this._voices?.voice;
        return voices?.[index] ?? null;
    }

    private checkAndGetSound = () => {
        const currentTime = Math.ceil(this.videoStreamStore.currentVideoTime);
        const index = this.findMatchingVoiceIndex(currentTime);
        const soundId = this.getSoundIdByIndex(index);

        return index !== -1 && soundId && this.isSoundLoaded(soundId) ? soundId : null;
    };

    get currentSoundToPlay(): ICurrentSoundPlay {
        const soundId = this.checkAndGetSound();
        return {
            isPlay: !!soundId,
            soundId: soundId,
        };
    }
}

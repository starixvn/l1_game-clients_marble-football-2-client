import { _decorator } from "cc";
import Observer from "observer";
import gc from "@sg/game-client-base";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { CommentatorsVoicesHandler } from "../features/commentators-voices/commentators-voices-handler";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import { CommentatorsVoicesStore, ICurrentSoundPlay } from "../features/commentators-voices/commentators-voices-store";
const { render, handle } = Observer;
const { ccclass } = _decorator;

@ccclass("CommentatorsVoices")
export class CommentatorsVoices extends ObserverComponent {
    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
        }
    }

    @handle(CommentatorsVoicesHandler, (handle) => handle.handleResetLoadedSounds())
    handleResetLoadedSounds() {}

    @handle(CommentatorsVoicesHandler, (handle) => handle.handleLoadAllSounds())
    handleLoadAllSounds() {}

    @render(CommentatorsVoicesStore, (store) => store.currentSoundToPlay)
    handlePlayVoice(currentSoundToPlay: ICurrentSoundPlay) {
        if (currentSoundToPlay.isPlay) {
            this.playSound(currentSoundToPlay.soundId);
        }
    }

    @render(VideoStreamStore, (store) => store.isPlayVideo)
    private onPlayVideo(isPlayVideo: boolean) {
        console.log("isPlayVideo", isPlayVideo);
        isPlayVideo && this.handleLoadAllSounds();
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }
}

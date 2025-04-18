import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { GamePhaseConfig, PhaseId, TimePointShowMatchWinner, TimePointTournament } from "../../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../../features/game-phase/game-phase-handler";
import { settings } from "../../game-settings";
import Observer from "observer";
import { _decorator } from "cc";
const { ccclass } = _decorator;

const { handle } = Observer;

@ccclass
export class PhasesRegistry extends ObserverComponent {
    private readonly showWinnerAndTournamentTimeOffset = 1;

    onLoad() {
        super.onLoad();
        this.registerAllPhases();
    }

    protected registerAllPhases() {
        this.registerPhaseMatchWinner();
        this.registerPhaseShowWinnerAndTournament();
        this.registerPhaseShowBetChoicesPrev();
        this.registerPhaseShowBetChoicesLive();
        this.registerPhaseShowIntroVideo();
        this.registerPhaseShowPrevVideo();
        this.registerPhaseShowLiveVideo();
        this.registerSettlement();
        this.registerPhaseHideBetChoicesPrev();
        this.registerPhaseHideBetChoicesLive();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseMatchWinner() {
        const config: GamePhaseConfig = {
            id: PhaseId.MatchWinner,
            begin: TimePointShowMatchWinner,
            end: TimePointTournament,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowWinnerAndTournament() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowWinnerAndTournament,
            begin: TimePointShowMatchWinner + this.showWinnerAndTournamentTimeOffset,
            end: settings.points.placingBetPreMatch + this.showWinnerAndTournamentTimeOffset,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowBetChoicesPrev() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowBetChoicesPrev,
            begin: settings.points.placingBetPreMatch,
            end: settings.points.placingBetPreMatch - settings.durations.placingBet,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowBetChoicesLive() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowBetChoicesLive,
            begin: settings.points.placingBetLiveMatch,
            end: settings.points.placingBetLiveMatch - settings.durations.placingBet,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowPrevVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowPrevVideo,
            begin: settings.points.streamingFirstHalfVideo,
            end: settings.points.streamingFirstHalfVideo - settings.durations.videoDuration,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowIntroVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowIntroVideo,
            begin: settings.points.introVideo,
            end: settings.points.introVideo - settings.durations.introVideo,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseShowLiveVideo() {
        const config: GamePhaseConfig = {
            id: PhaseId.ShowLiveVideo,
            begin: settings.points.streamingSecondHalfVideo,
            end: settings.points.streamingSecondHalfVideo - settings.durations.videoDuration,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerSettlement() {
        const config: GamePhaseConfig = {
            id: PhaseId.Settlement,
            begin: settings.durations.wholeRound,
            end: settings.durations.wholeRound - settings.durations.startRound,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseHideBetChoicesLive() {
        const config: GamePhaseConfig = {
            id: PhaseId.AutoHidePreviewBetChoicesLive,
            begin: settings.points.streamingSecondHalfVideo + settings.durations.hidePreviewBetChoices - settings.durations.videoDuration,
            end: 1,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    protected registerPhaseHideBetChoicesPrev() {
        const config: GamePhaseConfig = {
            id: PhaseId.AutoHidePreviewBetChoicesPrev,
            begin: settings.points.streamingFirstHalfVideo + settings.durations.hidePreviewBetChoices - settings.durations.videoDuration,
            end: settings.points.streamingFirstHalfVideo - settings.durations.videoDuration - 1,
        };
        return config;
    }
}

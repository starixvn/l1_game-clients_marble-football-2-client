import gc from "@sg/game-client-base";

export type DurationSetting = {
    wholeRound: number;
    showingResult?: number;
    generatingResult?: number;
    startRound?: number;
    introVideo: number;
    placingBet: number;
    lockingBet: number;
    tournament: number;
    matchWinner: number;
    videoDuration: number;
    showHaftTime: number;
};

export type PointsSetting = {
    introVideo: number;
    streamingFirstHalfVideo: number;
    streamingSecondHalfVideo: number;
    placingBetPreMatch: number;
    placingBetLiveMatch: number;
    lockingBetPreMatch: number;
    lockingBetLiveMatch: number;
};

export class MarbleGameSetting extends gc.GameConfigs.GameSetting {
    id: number;
    lobbyId?: number;
    name: string;
    configName?: string;
    durations: DurationSetting;
    choices?: string[];
    hedgeBetGroups?: string[][];
    numberOfRoundHistory: number;
    validateBalanceWhenBet?: boolean;
    durationShowPromptMessage?: number;
    isMiniGame?: boolean;
    points?: PointsSetting;
}

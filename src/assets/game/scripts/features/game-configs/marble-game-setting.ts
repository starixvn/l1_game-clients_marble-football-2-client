import gc from "@sg/game-client-base";

export type DurationSetting = {
    wholeRound: number;
    placingBetPreMatch: number;
    placingBetLiveMatch: number;
    lockingBetPreMatch: number;
    lockingBetLiveMatch: number;
    showingResult?: number;
    generatingResult?: number;
    startRound?: number;
    introVideo: number;
    streamingFirstHalfVideo: number;
    placingBet: number;
    lockingBet: number;
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
}

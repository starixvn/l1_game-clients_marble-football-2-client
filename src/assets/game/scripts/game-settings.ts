import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: 104,
    name: "MarbleFootball",
    durations: {
        wholeRound: 125,
        placingBet: 120,
        lockingBet: 93,
        streamingVideo: 90,
        generatingResult: 3,
        showingResult: 5,
        startRound: 2,
    },
    numberOfRoundHistory: 100,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings as any);
        container.bind(LogStore).to(LogStore);
    },
    features: [gc.RoundBasePF, ...gc.defaultFeatures],
};

import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: 104,
    name: "MarbleFootball",
    durations: {
        wholeRound: 130,
        placingBets: 125,
        lockingBet: 95,
        streamingVideo: 90,
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

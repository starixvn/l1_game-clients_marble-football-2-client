import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";
import * as MarbleFootball from "./features/feature";

export const settings = {
    id: 104,
    name: "MarbleFootball",
    durations: {
        wholeRound: 150,
        placingBet: 130,
        lockingBet: 105,
        streamingVideo: 103,
        videoDuration: 50,
        halfDuration: 45,
        generatingResult: 3,
        showingResult: 5,
        startRound: 12,
    },
    numberOfRoundHistory: 100,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings as any);
        container.bind(LogStore).to(LogStore);
    },
    features: [MarbleFootball, gc.RoundBasePF, ...gc.defaultFeatures],
};

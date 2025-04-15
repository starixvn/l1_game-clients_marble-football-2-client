import { Vec3, v3 } from "cc";

export interface TweenConfig {
    scale?: Vec3;
    position?: Vec3;
    opacity?: number;
    positionY?: number;
    time: number;
}

export interface TweenConfigs {
    in: TweenConfig;
    out: TweenConfig;
}

export type TweenKey =
    | "chipContainerFlyDown"
    | "fadeInOut"
    | "chipsFlyDown"
    | "teamScoreFlyUp"
    | "betChoiceZoomInOut"
    | "scoreboardFlyUp"
    | "teamScoreLiveFlyUp";

export const DURATION_ANIM_IN = 0.5;
export const DURATION_ANIM_OUT = 0.7;

export const DEFAULT_TWEEN_CONFIGS: Record<TweenKey, TweenConfigs> = {
    betChoiceZoomInOut: {
        in: { position: v3(0, -90, 0), time: DURATION_ANIM_IN },
        out: { position: v3(0, -650, 0), time: DURATION_ANIM_OUT },
    },
    chipContainerFlyDown: {
        in: { position: v3(0, 0, 0), time: DURATION_ANIM_IN },
        out: { position: v3(0, -560, 0), time: DURATION_ANIM_OUT },
    },
    fadeInOut: {
        in: { opacity: 255, time: DURATION_ANIM_IN },
        out: { opacity: 1, time: DURATION_ANIM_OUT },
    },
    chipsFlyDown: {
        in: { positionY: -306, opacity: 255, time: DURATION_ANIM_IN },
        out: { positionY: -535, opacity: 1, time: DURATION_ANIM_OUT },
    },
    teamScoreFlyUp: {
        in: { positionY: 303, opacity: 255, time: DURATION_ANIM_IN },
        out: { positionY: 630, opacity: 1, time: DURATION_ANIM_OUT },
    },
    scoreboardFlyUp: {
        in: { positionY: 290, opacity: 255, time: DURATION_ANIM_IN },
        out: { positionY: 600, opacity: 1, time: DURATION_ANIM_OUT },
    },
    teamScoreLiveFlyUp: {
        in: { positionY: 140, opacity: 255, time: DURATION_ANIM_IN },
        out: { positionY: 540, opacity: 1, time: DURATION_ANIM_OUT },
    },
};

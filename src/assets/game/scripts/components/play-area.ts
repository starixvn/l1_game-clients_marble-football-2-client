import gc from "@sg/game-client-base";
import { Node, Vec3, _decorator, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { GamePhase, GamePhaseConfig, PhaseId, TimePointShowMatchWinner } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { settings } from "../game-settings";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";

const { getUiOpacity } = AnimationUtils;
const { ccclass, property } = _decorator;
const { Rounds } = gc;
const { render, handle } = Observer;

type TweenKey = "chipContainerZoomInOut" | "fadeInOut" | "chipsFlyDown" | "teamScoreFlyUp" | "betChoiceZoomInOut";

interface TweenConfig {
    scale?: Vec3;
    position?: Vec3;
    opacity?: number;
    positionY?: number;

    time: number;
}

interface TweenConfigs {
    in: TweenConfig;
    out: TweenConfig;
}

@ccclass("PlayArea")
export class PlayArea extends ObserverComponent {
    private isZoomOut: boolean = false;
    private isScoreBoardOut: boolean = false;

    private mainPlayAreaTargets: Array<{ target: Node; key: TweenKey }>;

    @property(Node)
    private chipContainer: Node = null;

    @property(BetChoicesContainer)
    private betChoicesContainer: BetChoicesContainer = null;

    @property(Node)
    private scoreBoard: Node = null;

    @property(Node)
    private chips: Node = null;

    @property(Node)
    private teamScore: Node = null;

    @property([Node])
    private disappearingNodes: Node[] = [];

    private readonly tweenConfigs: Record<TweenKey, TweenConfigs> = {
        betChoiceZoomInOut: {
            in: { scale: v3(1, 1, 1), position: v3(0, -94, 0), time: 1 },
            out: { scale: v3(1, 1, 1), position: v3(0, -570, 0), time: 1.5 },
        },
        chipContainerZoomInOut: {
            in: { scale: v3(1, 1, 1), position: v3(0, -86, 0), time: 1 },
            out: { scale: v3(1, 1, 1), position: v3(0, -570, 0), time: 1.5 },
        },
        fadeInOut: {
            in: { opacity: 255, time: 0.5 },
            out: { opacity: 1, time: 1 },
        },
        chipsFlyDown: {
            in: { positionY: -285, opacity: 255, time: 1 },
            out: { positionY: -385, opacity: 0, time: 1 },
        },
        teamScoreFlyUp: {
            in: { positionY: 303, opacity: 255, time: 0.5 },
            out: { positionY: 630, opacity: 0, time: 0.75 },
        },
    };

    private readonly ShowWinnerAndTournament = "show-winner-and-tournament";
    private readonly ShowLiveScore = "show-live-score";
    private readonly ShowWinnerAndTournamentTimeOffset = 1;
    private readonly ShowBetChoicesTwoMatch = "show-bet-choices-two-match";
    private readonly Settlement = "settlement";

    protected containerBets: Node = null;

    onLoad() {
        this.containerBets = this.betChoicesContainer.firstHalfBetChoices.parent;
        this.mainPlayAreaTargets = [
            { target: this.containerBets, key: "betChoiceZoomInOut" },
            { target: this.containerBets, key: "betChoiceZoomInOut" },
            { target: this.chipContainer, key: "chipContainerZoomInOut" },
            { target: this.chips, key: "chipsFlyDown" },
        ];

        this.disappearingNodes.forEach((node) => {
            this.mainPlayAreaTargets.push({ target: node, key: "fadeInOut" });
        });

        this.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        super.onLoad();

        this.registerPhaseMatchWinner();
        this.registerPhaseShowLiveScore();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseMatchWinner() {
        const config: GamePhaseConfig = {
            id: this.ShowWinnerAndTournament,
            begin: TimePointShowMatchWinner + this.ShowWinnerAndTournamentTimeOffset,
            end: settings.points.placingBetPreMatch + this.ShowWinnerAndTournamentTimeOffset,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowLiveScore() {
        const config: GamePhaseConfig = {
            id: this.ShowLiveScore,
            begin: settings.points.streamingFirstHalfVideo + 1,
            end: 1,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseShowBetChoicesTwoMatch() {
        const config: GamePhaseConfig = {
            id: this.ShowBetChoicesTwoMatch,
            begin: settings.points.streamingFirstHalfVideo - settings.durations.videoDuration - settings.durations.showHaftTime,
            end: 3,
        };
        return config;
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerSettlement() {
        const config: GamePhaseConfig = {
            id: this.Settlement,
            begin: settings.durations.wholeRound,
            end: settings.durations.wholeRound - settings.durations.startRound,
        };
        return config;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        console.log("renderEnterPhase", phase.id);

        // H1
        if (phase.id === this.ShowWinnerAndTournament) {
            if (phase.progress === 0) {
                const duration = 0.2;
                this.scheduleOnce(
                    () => this.fadeOutBetChoiceNode(this.containerBets, true, duration),
                    this.ShowWinnerAndTournamentTimeOffset - duration
                );
            } else {
                this.fadeOutBetChoiceNode(this.containerBets, true, 0);
            }

            return;
        }

        if (phase.id === this.Settlement) {
            if (phase.progress === 0) {
                const duration = 0.2;
                this.scheduleOnce(
                    () => this.fadeOutBetChoiceNode(this.containerBets, false, duration),
                    this.ShowWinnerAndTournamentTimeOffset - duration
                );
            } else {
                this.fadeOutBetChoiceNode(this.containerBets, false, 0);
            }

            return;
        }

        if (phase.id === this.ShowLiveScore) {
            if (phase.progress === 0) {
                this.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in);
            } else {
                this.setStaticTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.in);
            }
            return;
        }

        if (phase.id === this.ShowBetChoicesTwoMatch) {
            this.betChoicesContainer.setFirstHalfDisabled(true);
        }
    }

    @render(GamePhaseStore, (store) => store.exitPhase)
    renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        console.log("renderExitPhase", phase.id);

        // H1
        if (phase.id === PhaseId.Tournament) {
            const duration = 0.2;
            this.scheduleOnce(() => {
                // this.betChoicesContainer.setNavigationButtonState(false);
                this.betChoicesContainer.setEnableFirstHalfBets();
                this.fadeOutBetChoiceNode(this.containerBets, false, duration);
            }, this.ShowWinnerAndTournamentTimeOffset - duration);
            return;
        }

        // H2
        if (phase.id === PhaseId.Halftime) {
            const duration = 0.2;
            this.scheduleOnce(() => {
                // this.betChoicesContainer.setNavigationButtonState(true);
                this.betChoicesContainer.setEnableAllBets();
                this.fadeOutBetChoiceNode(this.containerBets, false, duration);
            }, this.ShowWinnerAndTournamentTimeOffset - duration);
            return;
        }
    }

    fadeOutBetChoiceNode(node: Node, fadeOut: boolean, duration: number) {
        const opacity = fadeOut ? 1 : 255;

        if (duration === 0) {
            AnimationUtils.setOpacityNode(node, opacity);
            node.active = !fadeOut;
            return;
        }

        fadeOut ? AnimationUtils.fadeOutAndDeactivate(node, duration) : AnimationUtils.fadeInAndActivate(node, duration);
    }

    @render(gc.Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    async showPlayArea(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        try {
            await AnimationUtils.delayTime(settings.durations.outro);
            if (this.isZoomOut) {
                this.zoomPlayArea("in");
            }
            this.playAnimForTarget(this.teamScore, this.tweenConfigs.teamScoreFlyUp.out);
        } catch (e) {}
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setAnimAndPositionPlayArea(time: number) {
        if (time < 0) {
            return;
        }

        // At the begin of streaming
        if (time === settings.points.introVideo || time === settings.points.streamingSecondHalfVideo) {
            this.zoomPlayArea("out");
        }

        if (time === settings.points.placingBetPreMatch || time === settings.points.placingBetLiveMatch) {
            this.zoomPlayArea("in");
        }

        // During streaming
        if (!this.isZoomOut && time < settings.points.introVideo && time > 0) {
            this.setStaticPlayArea("out");
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundTime)
    async setScoreBoard(time: number) {
        if (time < 0) {
            return;
        }

        // Show scoreboard only during specific time ranges place bet
        const shouldShowScoreboard =
            (time <= settings.points.placingBetPreMatch && time > settings.points.introVideo) || // First range: 110-90 seconds
            (time <= settings.points.placingBetLiveMatch && time > settings.points.streamingSecondHalfVideo); // Second range: 52-32 seconds

        if (shouldShowScoreboard && this.isScoreBoardOut) {
            this.playAnimForTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.in);
            this.isScoreBoardOut = false;
        } else if (!shouldShowScoreboard && !this.isScoreBoardOut) {
            this.setStaticTarget(this.scoreBoard, this.tweenConfigs.fadeInOut.out);
            this.isScoreBoardOut = true;
        }
    }

    private playAnimForTarget(node: Node, config: TweenConfig): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(
                    config.time,
                    {
                        scale: config.scale ?? node.scale,
                        position: config.position ?? node.position,
                    },
                    { easing: "sineInOut" }
                )
                .call(() => resolve())
                .start();

            if (config.opacity !== undefined) {
                const uiOpacity = getUiOpacity(node);
                tween(uiOpacity)
                    .to(config.time, { opacity: config.opacity })
                    .call(() => resolve())
                    .start();
            }

            if (config.positionY !== undefined) {
                tween(node)
                    .to(config.time, { position: v3(node.position.x, config.positionY, node.position.z) })
                    .call(() => resolve())
                    .start();
            }
        });
    }

    private async zoomPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.mainPlayAreaTargets.map(({ target, key }) => this.playAnimForTarget(target, this.tweenConfigs[key][direction]))
        );
    }

    private setStaticTarget(node: Node, config: TweenConfig) {
        node.setPosition(config.position ?? node.position);
        node.setScale(config.scale ?? node.scale);

        if (config.opacity !== undefined) {
            const uiOpacity = getUiOpacity(node);
            uiOpacity.opacity = config.opacity;
        }

        if (config.positionY !== undefined) {
            node.setPosition(v3(node.position.x, config.positionY, node.position.z));
        }
    }

    private async setStaticPlayArea(direction: "in" | "out"): Promise<void> {
        this.isZoomOut = direction === "out";

        await Promise.all(
            this.mainPlayAreaTargets.map(({ target, key }) => this.setStaticTarget(target, this.tweenConfigs[key][direction]))
        );
    }
}

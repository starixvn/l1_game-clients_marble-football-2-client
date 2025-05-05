import gc from "@sg/game-client-base";
import { _decorator, Node, tween } from "cc";
import { AroundTablePlayerUtils } from "db://shared-components/game/around-table-player/scripts/utils";
import { TBalanceEffect, TWinningEffect } from "db://shared-components/game/balance-effect/scripts/stores/balance-effect-store";
import { ActionChipFlying, addChipsToChipBoxWhenJoinRoom } from "db://shared-components/game/chip-flying/scripts/components/actions";
import { ChipFlying as ChipFlyingShared, IChipFlyingInfo } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import Observer from "observer";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { BetChoicesContainer } from "./bet-options/bet-choices-container";
import { FunctionUtils } from "db://shared-components/shared/utils";
import { ChipsPreviewStore } from "../features/preview-bets/chips-preview-store";
import { BetItemsFinal } from "./bet-options/bet-items-final";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { Chips } = gc;

const CHIP_SOUND_ID = {
    GATHER_CHIPS: "gather-chips",
    DIVIDE_CHIPS: "divide-chips",
    PAY_CHIPS: "pay-chips",
};

@ccclass("ChipFlying")
export class ChipFlying extends ChipFlyingShared {
    @property(BetChoicesContainer)
    private betChoicesContainer: BetChoicesContainer = null;

    @property(Node)
    chipContainerPrev: Node = null;

    @property(Node)
    chipContainerLive: Node = null;

    @property(Node)
    chipContainerFinal: Node = null;

    chipContainers: Node[] = [];
    protected delayGetChips = 0.5;

    chipByChipComponents: Record<string, Node> = {};

    onLoad(): void {
        this.chipContainers = [this.chipContainerPrev, this.chipContainerLive, this.chipContainerFinal];

        super.onLoad();
    }

    protected start(): void {
        this.chipContainers.forEach((container) => (container.active = false));
    }

    actionPayChips(animated: boolean) {
        if (!animated) {
            ActionChipFlying.dealerGetChips(this.dealerChipBox, this.betItems?.lostBetItems, this);
            ActionChipFlying.dealerPayChips(this.dealerChipBox, this.betItems?.winBetItems, this);
            this.payChipToAllPlayersNew();
            return;
        }

        tween(this.node)
            .delay(this.delayGetChips)
            .call(() => {
                if (this.betItems?.lostBetItems?.length > 0) {
                    this.handlePlaySound(CHIP_SOUND_ID.GATHER_CHIPS);
                }
                ActionChipFlying.dealerGetChips(this.dealerChipBox, this.betItems?.lostBetItems, this);
            })
            .delay(this.chipDelayFlyingTime)
            .call(() => {
                if (this.betItems?.winBetItems?.length > 0) {
                    this.handlePlaySound(CHIP_SOUND_ID.DIVIDE_CHIPS);
                }
                ActionChipFlying.dealerPayChips(this.dealerChipBox, this.betItems?.winBetItems, this);
            })
            .delay(this.chipDelayFlyingTime)
            .call(() => {
                this.payChipToAllPlayersNew();
            })
            .start();
    }

    getChipsByChoice(choice: string): Node[] {
        const preChoice = choice.replace("Live", "");
        const pre = this.chipStorage[preChoice] ?? [];
        const live = this.chipStorage[`${preChoice}Live`] ?? [];
        return [...pre, ...live];
    }

    payChipToAllPlayersNew() {
        const chipFlyingInfo: IChipFlyingInfo = {
            slidingChip: this.slidingChip,
            hiddenPlayersNode: this.hiddenPlayersNode,
            mainPlayerAvatarNode: this.mainPlayerAvatarNode,
            payChipsDuration: this.payChipsDuration,
        };

        const cloneSettlementStatus = { ...this.settlementStatus };

        ActionChipFlying.payChipsToMainPlayer(
            this.getSettlementStatus(cloneSettlementStatus),
            chipFlyingInfo,
            this.betItems?.winBetItems,
            this
        );
        this.showPayoutForMainPlayerNew();

        if (this.hiddenPlayersNode) {
            ActionChipFlying.payChipsToHiddenPlayers(this.hiddenPlayersNode, this.betItems?.winBetItems, this);
        }

        this.payChipsToAroundTablePlayers();
        this.startShowResultAnimation = false;
    }

    protected payChipsToAroundTablePlayers() {
        if (this.winningPlayers === null || Object.keys(this.winningPlayers).length === 0) {
            return;
        }
        this.handlePlaySound(CHIP_SOUND_ID.PAY_CHIPS);

        const winningPlayerIds = Object.keys(this.winningPlayers);
        const winningEffects: TWinningEffect[] = [];
        const balanceEffects: TBalanceEffect[] = [];

        winningPlayerIds.forEach((playerId) => {
            const aroundTablePlayerSlot = AroundTablePlayerUtils.getAroundTablePlayerSlot(
                this.aroundTablePlayers?.aroundTablePlayerComponents,
                playerId
            );
            if (!aroundTablePlayerSlot) {
                return;
            }

            const winningPlayerData = this.winningPlayers[playerId];
            const playerBetItems = this.mergeWinningByChoices({ ...winningPlayerData.winningByChoices });

            const winBetItems = this.betItems.winBetItems ?? [];

            winBetItems?.forEach((item) => {
                const chipNodes = this.getChipsByChoice(item.betChoice);
                if (playerBetItems && playerBetItems[item.betChoice] > 0) {
                    this.moveChipsWithRandomAmount(chipNodes, aroundTablePlayerSlot.avatar.node, this.payChipsDuration);
                }
            });

            const { bet } = winningPlayerData;
            aroundTablePlayerSlot.increaseBalance(bet);
            winningEffects.push({ effectNode: aroundTablePlayerSlot.node, status: true });
            balanceEffects.push({ effectNode: aroundTablePlayerSlot.node, balance: bet });
        });

        this.aroundTablePlayersShowWinningEffect(winningEffects);
        this.updateAroundTablePlayersIncreaseBalance(balanceEffects);
    }

    showPayoutForMainPlayerNew() {
        if (this.settlementStatus?.win) {
            this.mainPlayerIncreaseBalance(this.settlementStatus?.bet);
            this.mainPlayerPlayWinningEffect();
            if (this.settlementStatus?.reachMaxWin && this.settlementStatus.reachMaxWin) {
                this.handleReachMaxWin();
            }

            this.getBalance();
            this.resetSettlementStatus();
        }
    }

    handlePlaySound(id: string) {
        if (Object.keys(this.chipStorage).length > 0) {
            this.playSound(id);
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }

    moveChipsToFinalContainer(chipContainer: Node) {
        if (!chipContainer) {
            return;
        }

        const children = [...chipContainer.children];
        chipContainer.setPosition(0, 0, 0);
        for (const child of children) {
            this.chipContainerFinal.addChild(child);
            chipContainer.removeChild(child);
        }
    }

    payChipsWhenReceivingSettlementResult(settlementResult: gc.GameServiceMessage.TSettlementResult) {}

    @render(
        ChipsPreviewStore,
        (store) => ({
            settlementResult: store.settlementResult,
            boundChipsFirstHalf: store.boundChipsFirstHalf,
            boundChipsSecondHalf: store.boundChipsSecondHalf,
        }),
        { fireImmediately: false }
    )
    payChipsInSettle(chipsSettlement: {
        settlementResult: gc.GameServiceMessage.TSettlementResult;
        boundChipsFirstHalf: boolean;
        boundChipsSecondHalf: boolean;
    }) {
        if (!this || !this.enablePlaceChips || !this.node || Object.keys(chipsSettlement.settlementResult).length === 0) {
            return;
        }

        if (this.node.activeInHierarchy) {
            this.startShowResultAnimation = true;
        }
        const { settlementResult, boundChipsFirstHalf, boundChipsSecondHalf } = chipsSettlement;

        if (boundChipsFirstHalf) {
            this.moveChipsToFinalContainer(this.chipContainerPrev);
        }
        if (boundChipsSecondHalf) {
            this.moveChipsToFinalContainer(this.chipContainerLive);
        }

        if (boundChipsFirstHalf && boundChipsSecondHalf) {
            return;
        }

        this.payChips(settlementResult);
    }

    payChips(settlementResult: gc.GameServiceMessage.TSettlementResult) {
        if (!this || !settlementResult || !this.enablePlaceChips || !this.node) {
            return;
        }

        const betItemsFinal = this.betChoicesContainer.betChoicesFinal.getComponent(BetItemsFinal);
        this.updateBetState(this.chipContainerFinal, betItemsFinal);
        this.betItems?.updateSettlementResult(settlementResult);
        if (!this.node.activeInHierarchy) {
            this.actionPayChips(false);
        } else {
            if (this.usingDelayPayChips) {
                tween(this.node)
                    .delay(this.delayAnimPayChips)
                    .call(() => this.actionPayChips(true))
                    .start();
            }
        }
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.ShowIntroVideo || phase.id === PhaseId.ShowLiveVideo) {
            this.inActiveAllChipContainers();
            return;
        }

        if (phase.id === PhaseId.Settlement) {
            this.updateBetState(this.chipContainerFinal, this.betChoicesContainer.getBetItemsFinal());
            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev) {
            this.updateBetState(this.chipContainerPrev, this.betChoicesContainer.getBetItemsPrevMath());
            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesLive) {
            this.updateBetState(this.chipContainerLive, this.betChoicesContainer.getBetItemsLive());
            return;
        }
        if (phase.id === PhaseId.AutoHidePreviewBetChoicesLive || phase.id === PhaseId.AutoHidePreviewBetChoicesPrev) {
            this.inActiveAllChipContainers();
        }
    }

    private updateBetState(container: any, betItems: any = []) {
        this.betItems = betItems;
        this.inActiveAllChipContainers();
        this.currentChipContainer = container;
        container.active = true;
    }

    @render(Chips.ChipStore, (store) => store.clearAllChips, { fireImmediately: false })
    clearChipsForAllBetItems() {
        this.chipStorage = {};
        this.chipContainers.forEach((container) => {
            container.destroyAllChildren();
        });
    }

    protected inActiveAllChipContainers() {
        this.chipContainers?.forEach((container) => {
            container && (container.active = false);
        });
    }

    override async flyChipsWhenJoinGame(chipsByMainPlayerRate: Record<string, any>) {}

    @render(ChipsPreviewStore, (store) => store.firstHalfChips)
    bindChipsFirstHalf(chipsByMainPlayerRate: Record<string, any>) {
        this.bindChipsWhenJoinGame(chipsByMainPlayerRate, this.chipContainerPrev);
    }

    @render(ChipsPreviewStore, (store) => store.secondHalfChips)
    bindChipsSecondHalf(chipsByMainPlayerRate: Record<string, any>) {
        this.bindChipsWhenJoinGame(chipsByMainPlayerRate, this.chipContainerLive);
    }

    async bindChipsWhenJoinGame(chipsByMainPlayerRate: Record<string, any>, chipContainer: Node) {
        if (Object.keys(chipsByMainPlayerRate).length === 0) {
            return;
        }

        const betItemsByChoice = await this.betChoicesContainer.betItemsByChoice();
        chipContainer.active = true;

        for (const [key, value] of Object.entries(chipsByMainPlayerRate)) {
            const chipGroup = value;
            const chipBox = betItemsByChoice[key].chipBox;
            if (chipGroup && chipBox) {
                const nodes = addChipsToChipBoxWhenJoinRoom(chipContainer, betItemsByChoice[key].chipBox, chipGroup, this.slidingChip);
                this.addChipsToBoxWithChoice(nodes, key);
            }
        }
    }

    @render(ChipsPreviewStore, (store) => store.finalChips)
    protected async handleAddChipsWhenJoinFinal(chipsByMainPlayerRate: Record<string, any>) {
        if (
            !this ||
            Object.keys(chipsByMainPlayerRate).length === 0 ||
            Object.keys(chipsByMainPlayerRate.chips).length === 0 ||
            !this.startShowResultAnimation
        ) {
            return;
        }

        const betItemsFinal = this.betChoicesContainer.betChoicesFinal.getComponent(BetItemsFinal);
        while (!betItemsFinal) {
            await FunctionUtils.delay(100);
        }
        const betItemsByChoice = betItemsFinal.betItemComponents.reduce((acc, item) => {
            acc[item.betChoice] = item;
            return acc;
        }, {});

        for (const [key, value] of Object.entries(chipsByMainPlayerRate.chips)) {
            const chipGroup: Record<string, any> = value;
            const choice = key.replace("Live", "");
            const chipBox = betItemsByChoice[choice].chipBox;
            if (chipGroup && chipBox) {
                const nodes = addChipsToChipBoxWhenJoinRoom(this.chipContainerFinal, chipBox, chipGroup, this.slidingChip);
                this.addChipsToBoxWithChoice(nodes, key);
            }
        }
        this.payChips(chipsByMainPlayerRate.settlementResult);
    }

    private mergeWinningByChoices(winningByChoices: Record<string, number> | null | undefined): Record<string, number> {
        const baseKeys = ["home", "away", "draw", "over", "under", "odd", "even"];
        const choices = winningByChoices ?? {};

        return Object.fromEntries(baseKeys.map((key) => [key, (choices[key] || 0) + (choices[`${key}Live`] || 0)]));
    }

    protected getSettlementStatus(settlementStatus: gc.GameServiceMessage.Status) {
        const mergedWinningByChoices = this.mergeWinningByChoices(settlementStatus.winningByChoices);

        return {
            winningByChoices: mergedWinningByChoices ?? {},
            win: settlementStatus.win ?? false,
            bet: settlementStatus.bet ?? 0,
        } as gc.GameServiceMessage.Status;
    }
}

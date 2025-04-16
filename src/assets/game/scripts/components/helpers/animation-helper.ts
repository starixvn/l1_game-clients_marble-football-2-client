import { Node, tween, v3 } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import { TweenConfig } from "./tween-configs";

const { getUiOpacity } = AnimationUtils;

export class AnimationHelper {
    static playAnimForTarget(node: Node, config: TweenConfig): Promise<void> {
        if (!node) {
            return Promise.resolve();
        }

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

    static setStaticTarget(node: Node, config: TweenConfig): void {
        if (!node) {
            return;
        }
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

    static async playAnimByPhaseProgress(nodes: Node | Node[], config: TweenConfig | TweenConfig[], phaseProgress: number) {
        const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
        const configArray = Array.isArray(config) ? config : [config];
        const finalConfigs = nodeArray.map((_, index) => configArray[index] || configArray[0]);
        if (phaseProgress === 0) {
            await Promise.all(nodeArray.map((node, index) => AnimationHelper.playAnimForTarget(node, finalConfigs[index])));
        } else {
            nodeArray.forEach((node, index) => {
                AnimationHelper.setStaticTarget(node, finalConfigs[index]);
            });
        }
    }
}

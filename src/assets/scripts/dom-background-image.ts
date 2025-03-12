export class DOMBackgroundImage {
    static readonly GAME_CONTAINER_ID = "Cocos3dGameContainer";
    static readonly GAME_CANVAS_ID = "GameCanvas";

    static readonly IMAGE_ID = "ImageBackground";

    static resizeObserver: ResizeObserver = new ResizeObserver(() => {
        DOMBackgroundImage.onResize();
    });

    static createBackgroundImageElement(imageSource: string): HTMLImageElement {
        const container = document.getElementById(DOMBackgroundImage.GAME_CONTAINER_ID);
        const game = document.getElementById(DOMBackgroundImage.GAME_CANVAS_ID);
        const image = document.getElementById(DOMBackgroundImage.IMAGE_ID) as HTMLImageElement;

        if (game) {
            DOMBackgroundImage.applyGameStyles(game);
        }

        if (!image) {
            const image = document.createElement("img");
            const size = container.getBoundingClientRect();

            image.id = DOMBackgroundImage.IMAGE_ID;

            DOMBackgroundImage.applyImageStyles(image, size);

            container.insertBefore(image, container.firstChild);

            DOMBackgroundImage.registerEvents();

            image.src = imageSource;
        }

        return image;
    }

    private static applyImageStyles(image: HTMLImageElement, size: DOMRect) {
        const isPortrait = size.width < size.height;

        image.style.visibility = "visible";
        image.style.position = "absolute";
        image.style.bottom = "0px";
        image.style.left = "0px";
        image.style.width = `${isPortrait ? size.height : size.width}px`;
        image.style.height = `${isPortrait ? size.width : size.height}px`;
        image.style.zIndex = "9";
        image.width = size.width;
        image.height = size.height;
    }

    private static applyGameStyles(game: HTMLElement) {
        game.style.zIndex = "11";
        game.style.position = "relative";
    }

    private static onResize() {
        const container = document.getElementById(DOMBackgroundImage.GAME_CONTAINER_ID);
        const size = container.getBoundingClientRect();
        const image = document.getElementById(DOMBackgroundImage.IMAGE_ID) as HTMLImageElement;

        if (image) {
            DOMBackgroundImage.applyImageStyles(image, size);
        }
    }

    private static registerEvents() {
        const container = document.getElementById(DOMBackgroundImage.GAME_CONTAINER_ID);

        DOMBackgroundImage.resizeObserver.observe(container);
    }

    private static unregisterEvents() {
        DOMBackgroundImage.resizeObserver.disconnect();
    }
}

export class DOMBackgroundImage {
    static readonly GAME_CONTAINER_ID = "Cocos3dGameContainer";
    static readonly GAME_CANVAS_ID = "GameCanvas";

    static readonly IMAGE_ID = "ImageBackground";

    static createBackgroundImageElement(): HTMLImageElement {
        const container = document.getElementById(DOMBackgroundImage.GAME_CONTAINER_ID);
        const image = document.getElementById(DOMBackgroundImage.IMAGE_ID) as HTMLImageElement;

        if (!image) {
            const image = document.createElement("img");
            const size = container.getBoundingClientRect();

            image.id = DOMBackgroundImage.IMAGE_ID;

            DOMBackgroundImage.applyImageStyles(image, size);

            container.insertBefore(image, container.firstChild);

            DOMBackgroundImage.registerEvents();

            return image;
        }

        image.src = "resources/background.jpg";

        return image;
    }

    private static applyImageStyles(image: HTMLImageElement, size: DOMRect) {
        image.style.visibility = "visible";
        image.style.position = "absolute";
        image.style.bottom = "0px";
        image.style.left = "0px";
        image.style.width = `${size.width}px`;
        image.style.height = `${size.height}px`;
        image.style.zIndex = "9";
        image.width = size.width;
        image.height = size.height;
    }

    private static onResize() {
        const container = document.getElementById(DOMBackgroundImage.GAME_CONTAINER_ID);
        const size = container.getBoundingClientRect();
        const image = DOMBackgroundImage.createBackgroundImageElement();

        DOMBackgroundImage.applyImageStyles(image, size);
    }

    private static registerEvents() {
        window.addEventListener("resize", DOMBackgroundImage.onResize);
    }

    private static unregisterEvents() {
        window.removeEventListener("resize", DOMBackgroundImage.onResize);
    }
}

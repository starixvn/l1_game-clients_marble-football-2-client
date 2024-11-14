export class DOMBackgroundVideo {
    static readonly GAME_CONTAINER_ID = "Cocos3dGameContainer";
    static readonly GAME_CANVAS_ID = "GameCanvas";

    static readonly VIDEO_ID = "VideoBackground";

    static createOrLoadVideoElement(): HTMLVideoElement {
        const container = document.getElementById(this.GAME_CONTAINER_ID);
        const game = document.getElementById(this.GAME_CANVAS_ID);
        const video = document.getElementById(this.VIDEO_ID) as HTMLVideoElement;

        if (game) {
            this.applyGameStyles(game);
        }

        if (!video) {
            const video = document.createElement("video");
            const size = container.getBoundingClientRect();

            video.id = this.VIDEO_ID;
            this.applyVideoStyles(video, size);

            container.insertBefore(video, container.firstChild);

            this.registerResizeEvent();

            return video;
        }

        return video;
    }

    static removeVideoElement() {
        const video = document.getElementById(this.VIDEO_ID) as HTMLVideoElement;

        if (video) {
            this.unregisterResizeEvent();
            video.remove();
        }
    }

    private static applyVideoStyles(video: HTMLVideoElement, size: DOMRect) {
        video.style.visibility = "visible";
        video.style.position = "absolute";
        video.style.bottom = "0px";
        video.style.left = "0px";
        video.style.width = `${size.width}px`;
        video.style.height = `${size.height}px`;
        video.style.zIndex = "10";
        video.width = size.width;
        video.height = size.height;
    }

    private static applyGameStyles(game: HTMLElement) {
        game.style.zIndex = "11";
        game.style.position = "relative";
    }

    private static onResize() {
        const container = document.getElementById(this.GAME_CONTAINER_ID);
        const size = container.getBoundingClientRect();
        const video = this.createOrLoadVideoElement();

        this.applyVideoStyles(video, size);
    }

    private static registerResizeEvent() {
        window.addEventListener("resize", this.onResize);
    }

    private static unregisterResizeEvent() {
        window.removeEventListener("resize", this.onResize);
    }
}

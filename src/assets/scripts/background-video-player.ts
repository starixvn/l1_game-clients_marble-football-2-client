import { _decorator, Component } from "cc";
import Hls from "hls.js";
import { DOMBackgroundVideo } from "./dom-background-video";

const { ccclass } = _decorator;

@ccclass("BackgroundVideoPlayer")
export class BackgroundVideoPlayer extends Component {
    private hls: Hls = null;
    private native: HTMLVideoElement = null;

    private _videoSource: string = "";

    private get initialized() {
        return !!this.hls && !!this.native;
    }

    nativeCurrentTime = 0;
    currentTime = 0;

    get videoSource() {
        return this._videoSource;
    }

    set videoSource(value: string) {
        if (value && this.videoSource !== value) {
            this._videoSource = value;

            this.play();
        }
    }

    get bandwidthEstimate() {
        return this.hls?.bandwidthEstimate ?? 0;
    }

    play() {
        if (!this.initialized) {
            this.initialize();
        }

        this.hls.loadSource(this.videoSource);
        this.native.play();
    }

    protected lateUpdate(dt: number): void {
        this.currentTime += dt;

        if (Math.abs(this.currentTime - this.nativeCurrentTime) > 1) {
            this.syncCurrentTime();
        }
    }

    protected onDestroy(): void {
        if (this.initialized) {
            this.native.removeEventListener("timeupdate", this.syncNativeCurrentTime.bind(this));

            this.hls.detachMedia();
            this.hls.destroy();
        }
    }

    private syncCurrentTime() {
        if (this.initialized) {
            this.native.currentTime = this.currentTime;
        }
    }

    private syncNativeCurrentTime() {
        if (this.initialized) {
            this.nativeCurrentTime = this.native.currentTime;
        }
    }

    private initialize() {
        const video = DOMBackgroundVideo.createOrLoadVideoElement();

        if (!Hls.isSupported()) {
            throw new Error("Hls.js is not supported.");
        }

        const hls = new Hls();

        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.log("[Hls.Error]: ", event, data);

            this.syncCurrentTime();
        });

        video.addEventListener("timeupdate", this.syncNativeCurrentTime.bind(this));

        this.native = video;
        this.hls = hls;
    }
}

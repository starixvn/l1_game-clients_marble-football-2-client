import { _decorator, Component } from "cc";
import gc from "@sg/game-client-base";
import Hls from "hls.js";
import { DOMBackgroundVideo } from "./dom-background-video";

const { ccclass } = _decorator;
const { sentryLogger } = gc;

@ccclass("BackgroundVideoPlayer")
export class BackgroundVideoPlayer extends Component {
    static readonly HIGH_RESOLUTION = "720p";
    static readonly LOW_RESOLUTION = "240p";
    static readonly BAND_WIDTH_FOR_HIGH_RESOLUTION = 500; // Bandwidth for HD resolution in KBps

    private hls: Hls = null;
    private native: HTMLVideoElement = null;

    private _videoSource: string = "";
    private _videoName: string = "";
    private _liveStreamServer: string = "";

    private get initialized() {
        return !!this.hls && !!this.native;
    }

    nativeCurrentTime = 0;
    currentTime = 0;
    currentResolution = BackgroundVideoPlayer.HIGH_RESOLUTION;

    playVideoWithVideoInfo(videoName: string, liveStreamServer: string) {
        if (videoName === "" || liveStreamServer === "") {
            return;
        }

        const videoUrl = new URL(`${videoName}_${this.currentResolution}.m3u8`, liveStreamServer).toString();

        if (this._videoSource !== videoUrl) {
            this._videoSource = videoUrl;
            this._videoName = videoName;
            this._liveStreamServer = liveStreamServer;

            this.play();
        }
    }

    updateVideoResolution(resolution: string) {
        console.log(`Updating video resolution to ${resolution}`);
        this.currentResolution = resolution;

        this.playVideoWithVideoInfo(this._videoName, this._liveStreamServer);
    }

    resetAllSettings() {
        this._videoSource = "";
        this._videoName = "";
        this._liveStreamServer = "";
        this.nativeCurrentTime = 0;
        this.currentTime = 0;
    }

    get bandwidthEstimate() {
        const bandwidthEstimate = this.hls?.bandwidthEstimate ?? 0;

        // Convert bps to KBps
        return bandwidthEstimate / 8_000;
    }

    play() {
        console.log("playing video: ", this._videoSource);
        if (!this.initialized) {
            this.initialize();
        }

        this.hls.loadSource(this._videoSource);
        this.native.play();
    }

    set muted(value: boolean) {
        if (this.initialized) {
            this.native.muted = value;
        }
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
            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                sentryLogger.logError(
                    JSON.stringify({
                        message: "Loading Error",
                        extra: {
                            videoName: this._videoName,
                            liveStreamServer: this._liveStreamServer,
                            bandwidth: this.bandwidthEstimate,
                        },
                    })
                );
            }
            this.syncCurrentTime();
        });

        video.addEventListener("timeupdate", this.syncNativeCurrentTime.bind(this));

        this.native = video;
        this.hls = hls;
    }
}

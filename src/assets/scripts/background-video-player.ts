import { _decorator, Component } from "cc";
import gc from "@sg/game-client-base";
import Hls from "hls.js";
import { DOMBackgroundVideo } from "./dom-background-video";

const { ccclass } = _decorator;
const { sentryLogger } = gc;

@ccclass("BackgroundVideoPlayer")
export class BackgroundVideoPlayer extends Component {
    static readonly BAND_WIDTH_FOR_HIGH_RESOLUTION = 500; // Bandwidth for HD resolution in KBps

    private hls: Hls = null;
    private native: HTMLVideoElement = null;

    private _videoSource: string = "";
    private _videoName: string = "";
    private liveStreamServer: string = "";
    private _muted = false;

    private get initialized() {
        return !!this.hls && !!this.native;
    }

    currentTime = 0;

    init(liveStreamServer: string) {
        this.liveStreamServer = liveStreamServer;
    }

    playVideoByName(videoName: string) {
        if (videoName === "" || this.liveStreamServer === "") {
            return;
        }

        const videoUrl = new URL(`${videoName}.m3u8`, this.liveStreamServer).toString();

        this._videoSource = videoUrl;
        this._videoName = videoName;

        this.play();
    }

    resetAllSettings() {
        this._videoSource = "";
        this._videoName = "";
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
        this.muted = this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;

        if (this.initialized) {
            this.native.muted = value;
        }
    }

    protected lateUpdate(dt: number): void {
        this.currentTime += dt;
    }

    protected onDestroy(): void {
        if (this.initialized) {
            this.hls.off(Hls.Events.ERROR);
            this.native.removeEventListener("timeupdate", this.syncCurrentTime.bind(this));
            this.hls.detachMedia();
            this.hls.destroy();
        }
    }

    private syncCurrentTime() {
        const needSync = this.currentTime >= 0 && Math.abs(this.currentTime - this.native.currentTime) > 1;

        if (this.initialized && needSync) {
            this.native.currentTime = this.currentTime;
        }
    }

    private initialize() {
        const video = DOMBackgroundVideo.createOrLoadVideoElement();

        if (!Hls.isSupported()) {
            throw new Error("Hls.js is not supported.");
        }

        const hls = new Hls({
            startLevel: -1,
            capLevelToPlayerSize: true,
            lowLatencyMode: true,
            liveSyncDuration: 0.9,
            liveMaxLatencyDuration: 1,
        });

        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.log("[Hls.Error]: ", event, data);

            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                sentryLogger.logError(
                    JSON.stringify({
                        message: data.details,
                        extra: {
                            videoName: this._videoName,
                            liveStreamServer: this.liveStreamServer,
                            bandwidth: this.bandwidthEstimate,
                        },
                    })
                );
            }

            this.syncCurrentTime();
        });

        video.addEventListener("timeupdate", this.syncCurrentTime.bind(this));

        this.native = video;
        this.hls = hls;
    }
}

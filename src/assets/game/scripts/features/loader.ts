import { Container } from "inversify";
import { VideoStreamHandlers, VideoStreamStore } from "./video-stream";

export const onMarbleFootballContainerCreated = (container: Container) => {
    container.bind(VideoStreamStore).to(VideoStreamStore);
    container.bind(VideoStreamHandlers).to(VideoStreamHandlers);
};

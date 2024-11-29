"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

const ObjectDetection = () => {
    const [isLoading, setIsLoading] = useState(true);

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const runCoco = async () => {
        setIsLoading(true);
        const net = await cocoSSDLoad();
        setIsLoading(false);

        const detectInterval = setInterval(() => {
            if (
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4
            ) {
                runObjectDetection(net);
            }
        }, 100);
    };

    async function runObjectDetection(net) {
        if (
            canvasRef.current &&
            webcamRef.current.video?.readyState === 4
        ) {
            const video = webcamRef.current.video;
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;

            const detectedObjects = await net.detect(video, undefined, 0.6);
            console.log(detectedObjects);

            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            detectedObjects.forEach((obj) => {
                const [x, y, width, height] = obj.bbox;
                ctx.strokeStyle = "#00FF00";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                ctx.fillStyle = "#00FF00";
                ctx.font = "18px Arial";
                ctx.fillText(obj.class, x, y > 10 ? y - 5 : 10);
            });
        }
    }

    const showMyVideo = () => {
        if (
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4
        ) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        runCoco();
        const videoCheckInterval = setInterval(() => {
            showMyVideo();
        }, 100);

        return () => clearInterval(videoCheckInterval);
    }, []);

    return (
        <div className="mt-8">
            {isLoading ? (
                <div className="gradient-text">Loading AI Model</div>
            ) : (
                <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
                    <Webcam
                        ref={webcamRef}
                        className="rounded-md w-full lg:h-[720px]"
                        muted
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
                    />
                </div>
            )}
        </div>
    );
};

export default ObjectDetection;

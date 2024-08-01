import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import appService from '../services/appService';
import { Bahmni } from '../utils/constants/Bahmni';

interface CapturePhotoProps {
    onCapture: (image: string) => Promise<void>;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ onCapture }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [captureActiveStream, setCaptureActiveStream] = useState<MediaStream | null>(null);
    const [imageUploadSize, setImageUploadSize] = useState<number>(Bahmni.Common.Constants.defaultImageUploadSize);
    const captureVideoRef = useRef<HTMLVideoElement>(null);
    const captureCanvasRef = useRef<HTMLCanvasElement>(null);
    const uploadCanvasRef = useRef<HTMLCanvasElement>(null);
    const uploadFieldRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const configValue = appService.getAppDescriptor().getConfigValue("imageUploadSize");
        if (configValue && configValue > Bahmni.Common.Constants.maxImageUploadSize) {
            setImageUploadSize(Bahmni.Common.Constants.maxImageUploadSize);
        } else {
            setImageUploadSize(configValue || Bahmni.Common.Constants.defaultImageUploadSize);
        }
    }, []);

    const confirmImage = (canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL("image/jpeg");
        onCapture(image)
            .then(() => {
                setDialogOpen(false);
            })
            .catch(() => {
                alert("Failed to save image. Please try again later");
            });
    };

    const drawImage = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, image: HTMLImageElement | HTMLVideoElement, imageWidth: number, imageHeight: number) => {
        const pixelRatio = window.devicePixelRatio;
        const sourceX = 0;
        const sourceY = 0;
        const destX = 0;
        const destY = 0;
        let stretchRatio, sourceWidth, sourceHeight;
        if (canvas.width > canvas.height) {
            stretchRatio = (imageWidth / canvas.width);
            sourceWidth = imageWidth;
            sourceHeight = Math.floor(canvas.height * stretchRatio);
            sourceY = Math.floor((imageHeight - sourceHeight) / 2);
        } else {
            stretchRatio = (imageHeight / canvas.height);
            sourceWidth = Math.floor(canvas.width * stretchRatio);
            sourceHeight = imageHeight;
            sourceX = Math.floor((imageWidth - sourceWidth) / 2);
        }
        const destWidth = Math.floor(canvas.width / pixelRatio);
        const destHeight = Math.floor(canvas.height / pixelRatio);
        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    };

    const launchPhotoCapturePopup = () => {
        if (dialogOpen) {
            alert("Please allow access to web camera and wait for photo capture dialog to be launched");
            return;
        }
        setDialogOpen(true);
        const navigatorUserMedia = navigator.mediaDevices?.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((localMediaStream) => {
                    if (captureVideoRef.current) {
                        captureVideoRef.current.srcObject = localMediaStream;
                    }
                    setCaptureActiveStream(localMediaStream);
                })
                .catch(() => {
                    alert("Could not get access to web camera. Please allow access to web camera");
                });
        } else if (navigatorUserMedia) {
            navigatorUserMedia(
                { video: true, audio: false },
                (localMediaStream) => {
                    if (captureVideoRef.current) {
                        captureVideoRef.current.srcObject = localMediaStream;
                    }
                    setCaptureActiveStream(localMediaStream);
                },
                () => {
                    alert("Could not get access to web camera. Please allow access to web camera");
                }
            );
        } else {
            alert('Photo capture is not supported in your browser. Please use chrome');
        }
    };

    const captureConfirmImage = () => {
        if (captureCanvasRef.current) {
            confirmImage(captureCanvasRef.current);
        }
    };

    const captureClickImage = () => {
        if (captureCanvasRef.current && captureVideoRef.current) {
            const context = captureCanvasRef.current.getContext("2d");
            if (context) {
                drawImage(captureCanvasRef.current, context, captureVideoRef.current, captureVideoRef.current.videoWidth, captureVideoRef.current.videoHeight);
            }
        }
    };

    const uploadConfirmImage = () => {
        if (uploadCanvasRef.current) {
            confirmImage(uploadCanvasRef.current);
        }
    };

    const launchPhotoUploadPopup = () => {
        if (dialogOpen) {
            alert("Please wait for photo upload dialog to be launched");
            return;
        }
        setDialogOpen(true);
    };

    const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type && !file.type.startsWith('image/')) {
            alert(t("FILE_UPLOAD_MUST_BE_IMAGE"));
            return;
        }
        if (file && file.size <= imageUploadSize) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const image = new Image();
                image.onload = () => {
                    if (uploadCanvasRef.current) {
                        const context = uploadCanvasRef.current.getContext("2d");
                        if (context) {
                            drawImage(uploadCanvasRef.current, context, image, image.width, image.height);
                        }
                    }
                };
                image.src = e.target?.result as string;
            };
            fileReader.readAsDataURL(file);
        } else {
            const imageUploadSizeInKb = imageUploadSize / 1000;
            const displayMessage = imageUploadSizeInKb >= 1000 ? `${Math.floor(imageUploadSizeInKb / 1000)}MB` : `${Math.floor(imageUploadSizeInKb)}KB`;
            alert(`${t("FILE_UPLOAD_MUST_BE_LESS_THAN")} ${displayMessage}`);
            if (uploadFieldRef.current) {
                uploadFieldRef.current.value = "";
            }
        }
    };

    return (
        <>
            <Button onClick={launchPhotoCapturePopup}>Capture Photo</Button>
            <Button onClick={launchPhotoUploadPopup}>Upload Photo</Button>

            <Modal show={dialogOpen} onHide={() => setDialogOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Capture Photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <video ref={captureVideoRef} autoPlay></video>
                    <canvas ref={captureCanvasRef}></canvas>
                    <Button onClick={captureClickImage}>Click Image</Button>
                    <Button onClick={captureConfirmImage}>Confirm Image</Button>
                </Modal.Body>
            </Modal>

            <Modal show={dialogOpen} onHide={() => setDialogOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="file" ref={uploadFieldRef} onChange={uploadImage} />
                    <canvas ref={uploadCanvasRef}></canvas>
                    <Button onClick={uploadConfirmImage}>Confirm Image</Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default CapturePhoto;

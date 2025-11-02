import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, CameraOff, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  startTracking,
  stopTracking,
  incrementRep,
  nextSet,
  setFeedback,
} from '../store/poseTrackingSlice';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import Timer from '../components/Timer';
import Confetti from 'react-confetti';

const PoseTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const poseTracking = useAppSelector((state) => state.poseTracking);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const exerciseName = location.state?.exercise || 'Exercise';
  const targetSets = location.state?.sets || 3;
  const targetReps = location.state?.reps || 10;

  useEffect(() => {
    if (exerciseName) {
      dispatch(startTracking({ exerciseName, targetReps, targetSets }));
    }

    return () => {
      dispatch(stopTracking());
      stopCamera();
    };
  }, [exerciseName, targetReps, targetSets, dispatch]);

  const initializePoseDetection = async () => {
    try {
      setIsModelLoading(true);
      dispatch(setFeedback('Loading pose detection model...'));

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      setPoseLandmarker(landmarker);
      setIsModelLoading(false);
      dispatch(setFeedback('Pose detection ready!'));
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      dispatch(setFeedback('Error loading pose detection model'));
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          dispatch(setFeedback('Camera started. Get into position...'));
        };
      }

      if (!poseLandmarker) {
        await initializePoseDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      dispatch(setFeedback('Camera access denied'));
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isCameraActive || !poseLandmarker || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastRepState = false;
    let animationFrameId: number;

    const detectPose = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const startTimeMs = performance.now();
        const results = poseLandmarker.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const drawingUtils = new DrawingUtils(ctx);

          drawingUtils.drawLandmarks(landmarks, {
            radius: 4,
            color: '#00FF00',
            fillColor: '#00FF00',
          });

          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#00FFFF',
            lineWidth: 2,
          });

          const leftShoulder = landmarks[11];
          const leftElbow = landmarks[13];
          const leftWrist = landmarks[15];

          if (leftShoulder && leftElbow && leftWrist) {
            const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);

            if (angle < 90 && !lastRepState) {
              lastRepState = true;
            } else if (angle > 160 && lastRepState) {
              lastRepState = false;
              dispatch(incrementRep());
            }
          }
        } else {
          dispatch(setFeedback('No pose detected. Move into frame.'));
        }
      }

      animationFrameId = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isCameraActive, poseLandmarker, dispatch]);

  const calculateAngle = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  const handleNextSet = () => {
    dispatch(nextSet());
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3 seconds
  };

  const handleFinish = () => {
    dispatch(stopTracking());
    stopCamera();
    navigate('/exercises');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pose Tracking</h1>
        <button
          onClick={() => navigate('/exercises')}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />

              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={startCamera}
                    disabled={isModelLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{isModelLoading ? 'Loading...' : 'Start Camera'}</span>
                  </button>
                </div>
              )}
            </div>

            {isCameraActive && (
              <button
                onClick={stopCamera}
                className="flex items-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg mt-4"
              >
                <CameraOff className="w-5 h-5" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {poseTracking.exerciseName}
            </h2>

            <div className="mb-6">
              <Timer />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Reps</span>
                  <span>
                    {poseTracking.currentReps} / {poseTracking.targetReps}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{
                      width: `${(poseTracking.currentReps / poseTracking.targetReps) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Sets</span>
                  <span>
                    {poseTracking.currentSet} / {poseTracking.targetSets}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${(poseTracking.currentSet / poseTracking.targetSets) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {poseTracking.feedback && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl">
                <p className="text-sm font-medium">{poseTracking.feedback}</p>
              </div>
            )}

            {poseTracking.currentReps >= poseTracking.targetReps &&
              poseTracking.currentSet < poseTracking.targetSets && (
                <button
                  onClick={handleNextSet}
                  className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Next Set</span>
                </button>
              )}

            {poseTracking.currentSet >= poseTracking.targetSets && (
              <button
                onClick={handleFinish}
                className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Finish Workout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
          />
        </div>
      )}
    </div>
  );
};

export default PoseTracking;

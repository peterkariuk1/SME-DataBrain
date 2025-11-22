"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  Loader2,
  Trash2,
  PenSquare,
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDoc, doc, setDoc } from "firebase/firestore";

const businessTypes = [
  "Retail",
  "Restaurant",
  "Service Provider",
  "E-commerce",
  "Health & Wellness",
  "Manufacturing",
  "Other",
];

const steps = [
  { id: "Step 1", name: "Owner Information" },
  { id: "Step 2", name: "Business Details" },
  { id: "Step 3", name: "Business Description" },
];

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, async (user) => {
  //     if (!user) return;

  //     const snap = await getDoc(doc(db, "users", user.uid));

  //     if (snap.exists() && snap.data()?.registrationCompleted) {
  //       router.push("/dashboard");
  //     }
  //   });

  //   return () => unsub();
  // }, []);

  // UI-only form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessType: "",
    otherBusinessType: "",
    paybillOrTill: "",
    businessDescriptionText: "",
  });
  const [cameraActive, setCameraActive] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Media states
  const [activeMediaTab, setActiveMediaTab] = useState<
    "text" | "audio" | "camera"
  >("text");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userDocId, setUserDocId] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  const { toast } = useToast();

  const router = useRouter();

  // Navigation
  const next = async () => {
    try {
      if (currentStep === 0) {
        // Auto authenticate: email = password
        const password = form.email;

        // Create user
        const userCred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          password
        );

        const uid = userCred.user.uid;
        setUserDocId(uid);

        // Create Firestore doc at users/{uid}
        const ownerData = {
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          createdAt: new Date(),
        };

        await setDoc(doc(db, "users", uid), ownerData);
      }

      if (currentStep === 1) {
        if (!userDocId) throw new Error("User UID missing.");

        const businessData = {
          businessName: form.businessName,
          businessType: form.businessType,
          otherBusinessType: form.otherBusinessType,
          paybillOrTill: form.paybillOrTill,
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "users", userDocId), businessData, {
          merge: true,
        });
      }

      // ⭐ MOVE TO NEXT STEP
      setCurrentStep((s) => s + 1);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Something went wrong.",
      });
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!userDocId) return;

    await setDoc(
      doc(db, "users", userDocId),
      {
        businessDescriptionText: form.businessDescriptionText,
        registrationCompleted: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    router.push("/dashboard");
  };

  // Audio Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteAudio = () => setAudioUrl(null);

  // Camera
  const toggleCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      // STOP camera
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());

      videoRef.current.srcObject = null;
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      setHasCameraPermission(true);
      if (videoRef.current) videoRef.current.srcObject = stream;

      setCameraActive(true); // ⭐ THIS IS WHAT YOU WERE MISSING
    } catch (err) {
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Enable camera permissions.",
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  // Capture image and send to backend for Google Vision analysis
  const sendToServer = async (blob: Blob) => {
    try {
      setIsProcessingImage(true);

      const formData = new FormData();
      formData.append("image", blob);

      const res = await fetch("http://localhost:5000/vision/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        toast({
          variant: "destructive",
          title: "Image Analysis Failed",
          description: data.error,
        });
        return;
      }

      // Autofill description text
      handleChange("businessDescriptionText", data.description);

      toast({
        title: "Image Processed",
        description: "Business description generated!",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) sendToServer(blob);
    }, "image/jpeg");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <Link href="/" className="mb-6">
        <Logo />
      </Link>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Join SME DataBrain and preview the UI.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* PROGRESS */}
          <div className="py-4 space-y-4">
            <Progress value={((currentStep + 1) / steps.length) * 100} />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`w-1/3 text-center ${
                    i === currentStep
                      ? "font-bold text-primary"
                      : i < currentStep
                      ? "text-green-400"
                      : ""
                  }`}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1 */}
              {currentStep === 0 && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                    <User /> Owner Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        placeholder="e.g., Jane Doe"
                        value={form.fullName}
                        onChange={(e) =>
                          handleChange("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+254 712 345 678"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          handleChange("phoneNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 2 */}
              {currentStep === 1 && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                    <Briefcase /> Business Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Name</Label>
                      <Input
                        placeholder="e.g., Acme Inc."
                        value={form.businessName}
                        onChange={(e) =>
                          handleChange("businessName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Business Type</Label>
                      <Select
                        onValueChange={(v) => handleChange("businessType", v)}
                        defaultValue={form.businessType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                          {businessTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {form.businessType === "Other" && (
                      <div className="sm:col-span-2">
                        <Label>Specify Business Type</Label>
                        <Input
                          placeholder="e.g., Tech Startup"
                          value={form.otherBusinessType}
                          onChange={(e) =>
                            handleChange("otherBusinessType", e.target.value)
                          }
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <Label>Paybill or Till Number</Label>
                      <Input
                        placeholder="e.g., 123456"
                        value={form.paybillOrTill}
                        onChange={(e) =>
                          handleChange("paybillOrTill", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 3 */}
              {currentStep === 2 && (
                <section>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                    <PenSquare /> Business Description
                  </h2>

                  <div className="rounded-lg border bg-card">
                    <div className="flex border-b">
                      {["text", "audio", "camera"].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveMediaTab(tab as any)}
                          className={`flex-1 p-3 text-sm font-medium ${
                            activeMediaTab === tab
                              ? "bg-muted text-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="p-4">
                      {activeMediaTab === "text" && (
                        <Textarea
                          placeholder="Describe your business..."
                          className="min-h-[150px]"
                          value={form.businessDescriptionText}
                          onChange={(e) =>
                            handleChange(
                              "businessDescriptionText",
                              e.target.value
                            )
                          }
                        />
                      )}

                      {activeMediaTab === "audio" && (
                        <div className="flex flex-col items-center gap-4 min-h-[150px]">
                          {!audioUrl ? (
                            <>
                              {!isRecording && (
                                <Button onClick={handleStartRecording}>
                                  <Mic className="mr-2" />
                                  Start Recording
                                </Button>
                              )}

                              {isRecording && (
                                <>
                                  <p className="text-sm flex items-center gap-2 text-primary">
                                    <Loader2 className="animate-spin" />{" "}
                                    Recording...
                                  </p>
                                  <Button
                                    variant="destructive"
                                    onClick={handleStopRecording}
                                  >
                                    <MicOff className="mr-2" />
                                    Stop Recording
                                  </Button>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full space-y-3">
                              <audio
                                src={audioUrl}
                                controls
                                className="w-full"
                              />
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAudio}
                                className="w-full"
                              >
                                <Trash2 className="mr-2" />
                                Delete & Re-record
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeMediaTab === "camera" && (
                        <div className="flex flex-col items-center gap-4 min-h-[150px]">
                          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                            <video
                              ref={videoRef}
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                            />
                          </div>

                          {!hasCameraPermission && (
                            <Alert variant="destructive">
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>
                                Enable camera permissions in your browser to
                                continue.
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" onClick={toggleCamera}>
                              {cameraActive ? (
                                <>
                                  <VideoOff className="mr-2" /> Stop Camera
                                </>
                              ) : (
                                <>
                                  <Video className="mr-2" /> Start Camera
                                </>
                              )}
                            </Button>

                            <Button
                              disabled={!cameraActive || isProcessingImage}
                              onClick={captureImage}
                            >
                              {isProcessingImage ? (
                                <>
                                  <Loader2 className="mr-2 animate-spin" />{" "}
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2" /> Take Picture
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CONTROLS */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>

            <Button onClick={currentStep === 2 ? handleSubmit : next}>
              {currentStep === 2 ? "Finish Demo" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

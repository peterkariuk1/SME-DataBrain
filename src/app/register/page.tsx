
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { User, Briefcase, ChevronRight, ChevronLeft, Mic, MicOff, Video, VideoOff, Camera, Loader2, Play, Pause, Trash2, PenSquare } from "lucide-react";

const businessTypes = [
  "Retail",
  "Restaurant",
  "Service Provider",
  "E-commerce",
  "Health & Wellness",
  "Manufacturing",
  "Other"
];

// Step 1: Owner Information
const ownerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Phone number seems too short."),
});

// Step 2: Business Details
const businessSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  businessType: z.string({ required_error: "Please select a business type." }),
  otherBusinessType: z.string().optional(),
  paybillOrTill: z.string().min(3, "This field seems too short."),
}).refine(data => data.businessType !== "Other" || !!data.otherBusinessType, {
  message: "Please specify your business type",
  path: ["otherBusinessType"],
});

// Step 3: Business Description (optional fields)
const descriptionSchema = z.object({
  businessDescriptionText: z.string().optional(),
});

const registrationSchema = ownerSchema.merge(businessSchema).merge(descriptionSchema);

type RegistrationFormValues = z.infer<typeof registrationSchema>;
type FieldName = keyof RegistrationFormValues;


const steps: { id: string; name: string; fields: FieldName[] }[] = [
    { id: 'Step 1', name: 'Owner Information', fields: ['fullName', 'email', 'phoneNumber'] },
    { id: 'Step 2', name: 'Business Details', fields: ['businessName', 'businessType', 'otherBusinessType', 'paybillOrTill'] },
    { id: 'Step 3', name: 'Business Description', fields: ['businessDescriptionText'] },
];



export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<"text" | "audio" | "camera">("text");
  const [otherBusinessTypeVisible, setOtherBusinessTypeVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const { control, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      businessName: '',
      paybillOrTill: '',
      businessDescriptionText: '',
      otherBusinessType: '',
    }
  });

  const businessType = watch("businessType");

  useEffect(() => {
    setOtherBusinessTypeVisible(businessType === "Other");
  }, [businessType]);


  const processForm = async (data: RegistrationFormValues) => {
    console.log({ ...data, audioUrl });
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "Registration Successful!",
      description: "Welcome! We're redirecting you to your dashboard.",
    });
     window.location.href = '/dashboard';
  };
  

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
        handleSubmit(processForm)();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };


  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions in your browser settings.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteAudio = () => {
    setAudioUrl(null);
  }

  const toggleCamera = useCallback(async () => {
    if (activeMediaTab === 'camera') {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      } else {
         try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
      }
    }
  }, [activeMediaTab, toast]);


  useEffect(() => {
    if (activeMediaTab === 'camera') {
      toggleCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [activeMediaTab, toggleCamera]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <Link href="/" className="mb-6">
        <Logo />
      </Link>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join SME DataBrain and unlock AI-powered insights for your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 space-y-4">
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                  {steps.map((step, index) => (
                      <div key={step.id} className={`w-1/3 text-center ${index === currentStep ? 'font-bold text-primary' : ''} ${index < currentStep ? 'text-green-400' : ''}`}>
                          {step.name}
                      </div>
                  ))}
              </div>
          </div>
          
          <form onSubmit={handleSubmit(processForm)} className="space-y-8 mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary"><User /> {steps[0].name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Controller name="fullName" control={control} render={({ field }) => <Input id="fullName" placeholder="e.g., Jane Doe" {...field} />} />
                        {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" placeholder="you@company.com" {...field} />} />
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Controller name="phoneNumber" control={control} render={({ field }) => <Input id="phoneNumber" type="tel" placeholder="+254 712 345 678" {...field} />} />
                        {errors.phoneNumber && <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>}
                      </div>
                    </div>
                  </section>
                )}

                {currentStep === 1 && (
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary"><Briefcase /> {steps[1].name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Controller name="businessName" control={control} render={({ field }) => <Input id="businessName" placeholder="e.g., Acme Inc." {...field} />} />
                        {errors.businessName && <p className="text-sm text-destructive mt-1">{errors.businessName.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="businessType">Business Type</Label>
                        <Controller
                            name="businessType"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="businessType">
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {businessTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        {errors.businessType && <p className="text-sm text-destructive mt-1">{errors.businessType.message}</p>}
                      </div>
                      {otherBusinessTypeVisible && (
                        <div className="sm:col-span-2">
                          <Label htmlFor="otherBusinessType">Specify Business Type</Label>
                          <Controller name="otherBusinessType" control={control} render={({ field }) => <Input id="otherBusinessType" placeholder="e.g., Tech Startup" {...field} />} />
                          {errors.otherBusinessType && <p className="text-sm text-destructive mt-1">{errors.otherBusinessType.message}</p>}
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <Label htmlFor="paybillOrTill">Paybill or Till Number</Label>
                        <Controller name="paybillOrTill" control={control} render={({ field }) => <Input id="paybillOrTill" placeholder="e.g., 123456" {...field} />} />
                        {errors.paybillOrTill && <p className="text-sm text-destructive mt-1">{errors.paybillOrTill.message}</p>}
                      </div>
                    </div>
                  </section>
                )}

                {currentStep === 2 && (
                  <section>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary"><PenSquare /> {steps[2].name}</h2>
                      <div className="rounded-lg border bg-card">
                        <div className="flex border-b">
                          <button type="button" onClick={() => setActiveMediaTab("text")} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeMediaTab === 'text' ? 'bg-muted text-primary' : 'hover:bg-muted/50'}`}>Text</button>
                          <button type="button" onClick={() => setActiveMediaTab("audio")} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeMediaTab === 'audio' ? 'bg-muted text-primary' : 'hover:bg-muted/50'}`}>Audio</button>
                          <button type="button" onClick={() => setActiveMediaTab("camera")} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeMediaTab === 'camera' ? 'bg-muted text-primary' : 'hover:bg-muted/50'}`}>Camera/Video</button>
                        </div>
                        <div className="p-4">
                          {activeMediaTab === 'text' && (
                            <Controller name="businessDescriptionText" control={control} render={({ field }) => (
                              <Textarea placeholder="Describe your business goals, target audience, and what makes you unique." className="min-h-[150px]" {...field} />
                            )} />
                          )}
                          {activeMediaTab === 'audio' && (
                            <div className="flex flex-col items-center justify-center gap-4 min-h-[150px]">
                              {!audioUrl ? (
                                <>
                                  <p className="text-sm text-muted-foreground text-center">Record a short audio description of your business.</p>
                                  <Button type="button" variant="outline" size="lg" onClick={isRecording ? handleStopRecording : handleStartRecording} className="w-40">
                                    {isRecording ? <><MicOff className="mr-2" /> Stop Recording</> : <><Mic className="mr-2" /> Start Recording</>}
                                  </Button>
                                  {isRecording && <p className="text-sm text-primary flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Recording...</p>}
                                </>
                              ) : (
                                <div className="w-full space-y-3">
                                  <p className="text-sm font-medium text-center">Your audio recording:</p>
                                  <audio src={audioUrl} controls className="w-full" />
                                  <Button type="button" variant="destructive" size="sm" onClick={handleDeleteAudio} className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete and re-record
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          {activeMediaTab === 'camera' && (
                              <div className="flex flex-col items-center justify-center gap-4 min-h-[150px]">
                                  <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                    {!hasCameraPermission && videoRef.current?.srcObject === null && <p className="text-destructive text-sm p-4">Camera access is required.</p>}
                                  </div>
                                  {!hasCameraPermission && (
                                      <Alert variant="destructive">
                                          <AlertTitle>Camera Access Required</AlertTitle>
                                          <AlertDescription>
                                              Please allow camera access to use this feature. You may need to grant permission in your browser's settings.
                                          </AlertDescription>
                                      </Alert>
                                  )}
                                  <div className="flex gap-2">
                                      <Button type="button" variant="outline" onClick={toggleCamera}>
                                          {videoRef.current?.srcObject ? <VideoOff className="mr-2"/> : <Video className="mr-2"/>}
                                          {videoRef.current?.srcObject ? 'Turn Off Camera' : 'Start Camera'}
                                      </Button>
                                      <Button type="button" disabled={!videoRef.current?.srcObject}>
                                          <Camera className="mr-2"/> Take Picture
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
            <div className="mt-8 pt-5">
                <div className="flex justify-between">
                    <Button type="button" onClick={prev} disabled={currentStep === 0} variant="outline">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button type="button" onClick={next}>
                        {currentStep === steps.length - 1 ? (
                            'Submit Registration'
                        ) : (
                            'Next'
                        )}
                        {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

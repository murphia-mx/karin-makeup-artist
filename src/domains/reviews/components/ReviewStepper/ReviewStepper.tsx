import { useState, useRef, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';


import { reviewSchema, type ReviewFormData } from '../../schemas/review.schema';
import { Step1Service } from './Steps/Step1Service';
import { Step2Rating } from './Steps/Step2Rating';
import { Step3Review } from './Steps/Step3Review';
import { Step4Photo } from './Steps/Step4Photo';
import { Step5Identity } from './Steps/Step5Identity';
import { Step6Success } from './Steps/Step6Success';
import { useSubmitReview } from '../../hooks/useSubmitReview';

interface ReviewStepperProps {
  isOpen: boolean;
  onClose: () => void;
  prefillService?: string;
  invitationId?: string;
}

export const ReviewStepper = ({ isOpen, onClose, prefillService, invitationId }: ReviewStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const methods = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      service_id: prefillService || '',
      rating: 0,
      review: '',
      client_name: '',
      city: '',
      invitation_id: invitationId || null,
      photo_url: null,
    },
    mode: 'onChange',
  });

  const submitMutation = useSubmitReview();

  const totalSteps = 5; // Step 6 is the success screen

  const handleNext = useCallback(async () => {
    // Validate current step before proceeding
    let isValid = false;
    if (currentStep === 1) isValid = await methods.trigger('service_id');
    if (currentStep === 2) isValid = await methods.trigger('rating');
    if (currentStep === 3) isValid = await methods.trigger('review');
    if (currentStep === 4) isValid = true; // Photo is optional

    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, methods]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);


  const onSubmit = async (data: ReviewFormData) => {
    if (submitLockRef.current) {
      console.warn('Idempotency protection: Ignored duplicate submit event.');
      return;
    }
    
    submitLockRef.current = true;
    setIsSubmitting(true);
    
    try {
      await submitMutation.mutateAsync(data);
      setCurrentStep(6);
    } catch (error) {
      // Error is handled by the mutation hook via toast
      submitLockRef.current = false; // Solo liberamos el lock si falla, para permitir reintentos
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion Variants for smooth transitions
  const variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
      scale: 0.96,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.4 },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
      scale: 0.96,
      transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.3 },
    }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[rgba(18,18,20,0.32)] backdrop-blur-[8px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-[#ffffff] rounded-[32px] border border-[#E5E5EA] shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header (Hidden on success) */}
        {currentStep !== 6 && (
          <div className="flex flex-col pt-8 pb-5 px-8 bg-[#ffffff] relative z-20">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handleBack}
                className={`p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] active:scale-95 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 text-[#3A2A31]'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center justify-center">
                <span className="font-sans font-medium text-[16px] text-[#1D1D1F] tracking-tight mb-1">
                  Comparte tu experiencia
                </span>
                <span className="text-[12px] font-sans font-medium text-[#8E8E93] tracking-wide">
                  Paso {currentStep} de {totalSteps}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 rounded-full text-[#3A2A31] hover:bg-[#F5F5F7] active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar Premium */}
            <div className="w-full h-[1px] bg-[#F5F5F7] rounded-full overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 bottom-0 bg-[rgb(198,130,145)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 scrollbar-premium">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 flex flex-col"
                >
                  {currentStep === 1 && <Step1Service onNext={handleNext} />}
                  {currentStep === 2 && <Step2Rating onNext={handleNext} />}
                  {currentStep === 3 && <Step3Review onNext={handleNext} />}
                  {currentStep === 4 && <Step4Photo onNext={handleNext} />}
                  {currentStep === 5 && (
                    <Step5Identity isSubmitting={isSubmitting} />
                  )}
                  {currentStep === 6 && <Step6Success onClose={onClose} />}
                </motion.div>
              </AnimatePresence>
            </form>
          </FormProvider>
        </div>
      </motion.div>
    </div>
  );
};

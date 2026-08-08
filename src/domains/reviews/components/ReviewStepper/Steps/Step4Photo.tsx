import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReviewFormData } from '../../../schemas/review.schema';

interface Step4PhotoProps {
  onNext: () => void;
}

export const Step4Photo = ({ onNext }: Step4PhotoProps) => {
  const { setValue } = useFormContext<ReviewFormData>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      // In a real app, upload `compressedFile` to Supabase Storage here and get URL.
      // For UX mock, we just create an object URL.
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreview(objectUrl);
      setValue('photo_url', objectUrl); // Pretend it's uploaded
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setValue('photo_url', null);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center text-center mt-2 relative">
      <div className="mb-10 text-center mt-2">
        <h2 className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-2">
          ¿Tienes alguna foto?
        </h2>
        <p className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto">
          A otras clientas les encantaría ver tu resultado final. (Opcional)
        </p>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center mt-2">
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="relative w-full max-w-[260px] aspect-[4/5] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-transparent"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-[#1D1D1F] hover:bg-white transition-all shadow-sm active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <div
              key="dropzone"
              {...getRootProps()}
              className={clsx(
                "w-full max-w-[260px] aspect-[4/5] rounded-[24px] border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-8",
                isDragActive 
                  ? "border-[rgb(74,36,50)] bg-[rgba(198,130,145,0.02)] scale-[1.02]" 
                  : "border-[#D1D1D6] bg-[#FAFAFB] hover:border-[#8E8E93] hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              )}
            >
              <input {...getInputProps()} />
              {isCompressing ? (
                <div className="flex flex-col items-center animate-pulse text-[#8E8E93]">
                  <ImageIcon className="w-8 h-8 mb-4 opacity-40" />
                  <p className="font-sans text-[13px] font-medium tracking-wide">Optimizando...</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-6 text-[#8E8E93] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#F5F5F7]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="font-sans text-[15px] font-medium text-[#1D1D1F] mb-1">Haz clic o arrastra</p>
                  <p className="font-sans text-[13px] text-[#A1A1AA]">JPG, PNG (máx 5MB)</p>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onNext}
        className={clsx(
          "group mt-8 inline-flex items-center justify-center gap-2 h-[52px] w-full rounded-full font-sans text-[15px] font-medium transition-all duration-300 active:scale-98",
          preview 
            ? "bg-[rgb(74,36,50)] text-white hover:bg-[rgb(54,26,40)] shadow-[0_8px_24px_rgba(74,36,50,0.15)] hover:-translate-y-0.5" 
            : "bg-white border border-[#E5E5EA] text-[#3A2A31] hover:bg-[#FAFAFB]"
        )}
      >
        {preview ? 'Siguiente paso' : 'Omitir este paso'}
      </button>
    </div>
  );
};

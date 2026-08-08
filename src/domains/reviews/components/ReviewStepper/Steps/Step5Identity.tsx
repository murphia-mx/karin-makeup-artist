import { useFormContext } from 'react-hook-form';
// motion removed
import { clsx } from 'clsx';
import type { ReviewFormData } from '../../../schemas/review.schema';

interface Step5IdentityProps {
  isSubmitting: boolean;
}

export const Step5Identity = ({ isSubmitting }: Step5IdentityProps) => {
  const { register, formState: { errors } } = useFormContext<ReviewFormData>();

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-10 text-center mt-2">
        <h2 className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-2">
          Casi listo
        </h2>
        <p className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto">
          Solo necesitamos tu nombre para publicar la reseña.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full mx-auto">
        <div className="group">
          <label className="block font-sans text-[12px] font-medium tracking-wide uppercase text-[#8E8E93] mb-2.5 pl-4">
            Tu Nombre *
          </label>
          <input
            {...register('client_name')}
            type="text"
            placeholder="Ej. Ana Sofía"
            className={clsx(
              "w-full px-6 py-4 rounded-[24px] bg-[#FAFAFB] border border-transparent focus:outline-none focus:bg-white focus:shadow-[0_8px_24px_rgba(0,0,0,0.04)] focus:ring-1 focus:ring-[#D1BCC4] hover:border-[#E5E5EA] transition-all duration-300 font-sans text-[16px] text-[#1D1D1F] placeholder-[#A1A1AA]",
              errors.client_name ? "ring-1 ring-red-300" : ""
            )}
          />
          {errors.client_name && (
            <p className="text-red-400 font-sans text-[12px] font-medium tracking-tight mt-2.5 pl-4">{errors.client_name.message}</p>
          )}
        </div>

        <div className="group">
          <label className="block font-sans text-[12px] font-medium tracking-wide uppercase text-[#8E8E93] mb-2.5 pl-4">
            Ciudad <span className="opacity-60">(Opcional)</span>
          </label>
          <input
            {...register('city')}
            type="text"
            placeholder="Ej. Madrid"
            className="w-full px-6 py-4 rounded-[24px] bg-[#FAFAFB] border border-transparent focus:outline-none focus:bg-white focus:shadow-[0_8px_24px_rgba(0,0,0,0.04)] focus:ring-1 focus:ring-[#D1BCC4] hover:border-[#E5E5EA] transition-all duration-300 font-sans text-[16px] text-[#1D1D1F] placeholder-[#A1A1AA]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          "group mt-8 inline-flex items-center justify-center gap-2 h-[52px] w-full rounded-full font-sans text-[15px] font-medium transition-all duration-300 active:scale-98",
          isSubmitting 
            ? "bg-[#F5F5F7] text-[#A1A1AA] cursor-not-allowed" 
            : "bg-[rgb(74,36,50)] text-white hover:bg-[rgb(54,26,40)] shadow-[0_8px_24px_rgba(74,36,50,0.15)] hover:-translate-y-0.5 cursor-pointer"
        )}
      >
        {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
      </button>
    </div>
  );
};

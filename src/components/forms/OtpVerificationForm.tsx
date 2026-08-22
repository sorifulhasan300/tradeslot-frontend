'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { KeyRound, Mail, Loader2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { verifyOtpSchema, VerifyOtpSchemaType } from '@/lib/validations/auth.schema';
import { verifyOtpAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OtpVerificationFormProps {
  email: string;
  onSuccess?: () => void;
}

export function OtpVerificationForm({ email, onSuccess }: OtpVerificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(60);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpSchemaType>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email,
      otp: '',
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = (data: VerifyOtpSchemaType) => {
    setFormError(null);
    startTransition(async () => {
      const res = await verifyOtpAction(data);
      if (res.success) {
        toast.success('Email Verified!', {
          description: 'Your account has been successfully verified.',
        });
        if (onSuccess) onSuccess();
      } else {
        setFormError(res.message || 'Invalid verification code.');
        toast.error('Verification Failed', {
          description: res.message || 'Invalid code.',
        });
      }
    });
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    toast.success('OTP Resent', {
      description: 'A new 6-digit verification code has been dispatched.',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="p-3 bg-muted/40 border border-border/60 rounded-lg text-xs space-y-1">
        <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
          <Mail className="h-3.5 w-3.5 text-primary" />
          Verification code sent to:
        </p>
        <p className="font-mono text-foreground font-semibold pl-5">{email}</p>
      </div>

      <input type="hidden" {...register('email')} value={email} />

      {/* OTP Input */}
      <div className="space-y-1.5">
        <Label htmlFor="otp" className="text-xs font-semibold text-foreground/80">
          6-Digit Verification Code
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <KeyRound className="h-4 w-4" />
          </div>
          <Input
            id="otp"
            type="text"
            maxLength={6}
            placeholder="123456"
            className={`pl-9 font-mono tracking-widest text-center text-lg font-bold ${
              errors.otp ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            {...register('otp')}
            disabled={isPending}
          />
        </div>
        {errors.otp && (
          <p className="text-xs text-destructive font-medium">{errors.otp.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md transition-all gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying Code...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Verify Email & Complete
          </>
        )}
      </Button>

      {/* Resend OTP */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isPending}
          className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resendCooldown > 0
            ? `Resend OTP code in ${resendCooldown}s`
            : 'Resend Verification Code'}
        </button>
      </div>
    </form>
  );
}

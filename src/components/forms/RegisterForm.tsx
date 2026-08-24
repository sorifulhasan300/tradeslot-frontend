'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Briefcase,
  UserCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { registerSchema, RegisterSchemaType } from '@/lib/validations/auth.schema';
import { registerAction } from '@/app/actions/auth.actions';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpVerificationForm } from './OtpVerificationForm';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'TRADER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterSchemaType) => {
    setFormError(null);
    startTransition(async () => {
      const res = await registerAction(data);
      if (res.success) {
        if (res.data?.requiresVerification || res.data?.user?.emailVerified === false) {
          setRequiresOtp(true);
          setPendingEmail(data.email);
          toast.info('Verification Required', {
            description: 'A 6-digit OTP verification code has been sent to your email.',
          });
        } else if (res.data?.user) {
          setAuth(res.data.user, res.data.token);
          toast.success('Account Created!', {
            description: 'Your account was created successfully.',
          });
          if (onSuccess) onSuccess();
          else router.push('/dashboard');
        }
      } else {
        setFormError(res.message || 'Registration failed. Please check inputs.');
        toast.error('Registration Failed', {
          description: res.message || 'Could not create account.',
        });
      }
    });
  };

  if (requiresOtp && pendingEmail) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1 mb-4">
          <h3 className="text-lg font-bold text-foreground">Verify Your Email</h3>
          <p className="text-xs text-muted-foreground">
            Please enter the 6-digit verification code to activate your account.
          </p>
        </div>
        <OtpVerificationForm
          email={pendingEmail}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            else router.push('/login');
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Demo Sign-In Quick Notice */}
      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-foreground flex items-start gap-2.5 shadow-sm">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-primary">Testing TradeSlot?</p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Instant 1-click Demo Accounts for Customer, Trader, Business & Super Admin are ready on the{' '}
            <Link href="/login" className="font-bold text-primary hover:underline inline-flex items-center gap-0.5">
              Sign In page <ArrowRight className="h-3 w-3 inline" />
            </Link>
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground/80">Account Type</Label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border/60">
          <button
            type="button"
            onClick={() => setValue('role', 'TRADER', { shouldValidate: true })}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              selectedRole === 'TRADER'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Trade Professional
          </button>
          <button
            type="button"
            onClick={() => setValue('role', 'CUSTOMER', { shouldValidate: true })}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              selectedRole === 'CUSTOMER'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Customer
          </button>
        </div>
        {errors.role && (
          <p className="text-xs text-destructive font-medium">{errors.role.message}</p>
        )}
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">
          Full Name
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <UserIcon className="h-4 w-4" />
          </div>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className={`pl-9 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            {...register('name')}
            disabled={isPending}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
          Email Address
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="trader@example.com"
            className={`pl-9 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            {...register('email')}
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">
          Phone Number (BD or International)
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+8801700000000 or +447911123456"
            className={`pl-9 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            {...register('phone')}
            disabled={isPending}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 chars with uppercase & digit"
            className={`pl-9 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            {...register('password')}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
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
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}

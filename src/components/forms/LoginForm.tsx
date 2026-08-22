'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, LoginSchemaType } from '@/lib/validations/auth.schema';
import { loginAction } from '@/app/actions/auth.actions';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    setFormError(null);
    startTransition(async () => {
      const res = await loginAction(data);
      if (res.success && res.data?.user) {
        setAuth(res.data.user, res.data.token);
        toast.success('Welcome back!', {
          description: 'Logged in successfully',
        });
        if (onSuccess) {
          onSuccess();
        } else {
          const role = res.data.user.role;
          const explicitRedirect = redirectTo || searchParams.get('redirect');
          const targetPath = explicitRedirect || (role === 'CUSTOMER' ? '/customer/dashboard' : '/dashboard');
          router.push(targetPath);
        }
      } else {
        setFormError(res.message || 'Invalid email or password. Please try again.');
        toast.error('Authentication Failed', {
          description: res.message || 'Invalid email or password.',
        });
      }
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

      {/* Email Input */}
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

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
            Password
          </Label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
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
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}

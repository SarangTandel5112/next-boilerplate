'use client';

import Link from 'next/link';
import { AppLogo, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from '@/modules/common';
import { useLoginForm } from '../hooks';

const spotlightStats = [
  { label: 'Products', value: '1.2k+' },
  { label: 'Categories', value: '48' },
  { label: 'Uptime', value: '99.9%' },
] as const;

export const LoginForm = () => {
  const { errors, formError, handleSubmit, isSubmitting, register } = useLoginForm();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.16),_transparent_50%)]" />

      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <AppLogo />
            <div className="space-y-3">
              <p className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                East Coast Lubricant
              </p>
              <h1 className="text-3xl leading-tight font-semibold text-neutral-50">
                Manage operations with a clean, focused admin workspace.
              </h1>
              <p className="max-w-md text-sm text-neutral-300">
                Manage products, categories, and brands with a clean, focused admin workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {spotlightStats.map(item => (
              <div key={item.label} className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                <p className="text-xs text-neutral-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-neutral-100">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="mx-auto w-full max-w-md border-neutral-800 bg-neutral-900/85 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Use your admin credentials to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@eastcoastlubricant.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                {errors.email?.message ? <p className="text-xs text-red-400">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-blue-300 transition hover:text-blue-200">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                {errors.password?.message ? <p className="text-xs text-red-400">{errors.password.message}</p> : null}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-400" htmlFor="remember">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-500 focus:ring-blue-500"
                    {...register('remember')}
                  />
                  Remember me
                </label>
                <span className="text-neutral-500">Secure login</span>
              </div>

              {formError ? <p className="text-xs text-amber-300">{formError}</p> : null}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-neutral-500">
              Secure session cookies are used for admin access.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

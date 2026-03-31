import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-64px)] pb-16">
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>

      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center uppercase tracking-[0.2em] font-black">
        Academy Core <span className="text-slate-300 dark:text-slate-800">•</span> Fase 2
      </p>
    </main>
  );
}

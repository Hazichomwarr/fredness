import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getAdminSession } from "@/src/lib/auth/admin";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin Login | Frednes International Market",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function adminCallbackUrl(value: string | undefined) {
  if (!value || value === "/admin/login" || !value.startsWith("/admin")) {
    return "/admin";
  }

  return value;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};
  const callbackUrl = adminCallbackUrl(firstParam(params.callbackUrl));
  const hasError = Boolean(firstParam(params.error));

  async function loginAction(formData: FormData) {
    "use server";

    const redirectTo = adminCallbackUrl(String(formData.get("redirectTo") ?? ""));

    try {
      await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        const params = new URLSearchParams({
          error: "credentials",
          callbackUrl: redirectTo,
        });

        redirect(`/admin/login?${params.toString()}`);
      }

      throw error;
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16 text-neutral-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-md gap-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Frednes Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Admin access is restricted to the store owner.
          </p>
        </div>

        {hasError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            Invalid admin email or password.
          </p>
        ) : null}

        <form action={loginAction} className="grid gap-4">
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-neutral-950"
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-neutral-950"
              required
            />
          </label>
          <button className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  getMetaAdminDashboardSecret,
  isMetaAdminSessionTokenValid,
  META_ADMIN_COOKIE,
} from "../../../lib/adminDashboardAuth";

export const metadata: Metadata = {
  title: "Intern inloggning | Finansanalytik",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MetaAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const secret = getMetaAdminDashboardSecret();

  if (!secret) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(META_ADMIN_COOKIE)?.value;

  if (isMetaAdminSessionTokenValid(sessionToken, secret)) {
    redirect("/admin/meta");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090b] px-4 py-10 text-zinc-50">
      <section className="w-full max-w-md border border-[#26313d] bg-[#0d1117] p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
          Intern admin
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.03em]">
          Logga in
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
          Den här sidan är bara för intern hantering av kampanjutkast.
        </p>

        {error ? (
          <p className="mt-5 border border-red-300/50 bg-red-950/20 px-4 py-3 text-sm font-bold text-red-200">
            Fel lösenord.
          </p>
        ) : null}

        <form action="/api/meta-admin-login" className="mt-6 space-y-4" method="post">
          <label className="block text-sm font-bold text-[#d7e1eb]">
            Adminlösenord
            <input
              autoComplete="current-password"
              className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-white outline-none focus:border-emerald-300"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#06100c]"
            type="submit"
          >
            Fortsätt
          </button>
        </form>
      </section>
    </main>
  );
}

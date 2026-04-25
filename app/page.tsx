export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 lg:px-8">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
            Finance Analytics Weekly
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Аналитика рынков, которую читают, когда нужны решения, а не шум
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
            Премиальная финансовая аналитика с понятной подачей, кратким превью,
            возможностью купить полный материал или подписаться на еженедельную рассылку.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:scale-[1.02]">
              Читать аналитику
            </button>
            <button className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-white/80 transition hover:border-white/30 hover:text-white">
              Подписаться на weekly
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              Preview
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Нефть, доллар и риск-сентимент: что меняется на этой неделе
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Краткий фрагмент аналитики показывает направление мысли, основные
              сигналы и контекст, а полный текст доступен после покупки.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              One-time purchase
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Купи полный разбор
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Пользователь может открыть платежную страницу Stripe и получить
              полный материал после успешной оплаты.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              Weekly subscription
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Подписка на weekly аналитику
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Еженедельная подписка для тех, кто хочет стабильно получать
              аналитику на email без ручной покупки каждого материала.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
# Implementation principles

These rules apply to every product change in Finansanalytik.

1. Every implementation must create real product value: improve conversion, user flow, reliability, analysis quality, security, or operational control.
2. Do not add placeholders, fake logic, unfinished flows, or temporary UI that looks production-ready but is not connected end to end.
3. Do not break existing paid, free-report, subscription, daily pipeline, email, Stripe, or legal flows.
4. If a change affects a commercial offer, consent, subscription, email delivery, or payment wording, update the legal and checkout copy in the same implementation.
5. Prefer simple, maintainable flows. Do not add process weight or new services without direct operational value.
6. Preserve the product's core logic: primary sources are stored, data and rules are separate, analysis is generated from processed evidence, and paid/free access levels are enforced on the backend.
7. Preserve analysis volume and quality when tightening filters. Quality controls should prevent bad output without starving the report.
8. Verify changes with the strongest practical checks before delivery: syntax/build/lint, endpoint smoke checks, and production checks after deployment when possible.
9. External service changes must be explicit: Stripe, SMTP, Render, Vercel, Meta, Google, and Cloudflare configuration must match the code path.
10. User-facing Swedish copy must be clear, compliant, and avoid investment advice, trading signals, guaranteed returns, or buy/sell recommendations.

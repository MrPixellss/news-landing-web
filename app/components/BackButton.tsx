"use client";

export function BackButton() {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  }

  return (
    <button
      className="mb-5 inline-flex text-base font-bold text-emerald-300 transition hover:text-emerald-200"
      onClick={goBack}
      type="button"
    >
      ← Tillbaka
    </button>
  );
}

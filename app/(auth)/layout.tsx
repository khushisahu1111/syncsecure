import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — modern dark with green accent */}
      <section
        className="hidden w-1/2 items-center justify-center lg:flex xl:w-2/5"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
        }}
      >
        <div className="flex max-h-[800px] max-w-[380px] flex-col items-center justify-center space-y-10 px-8 text-center">

          {/* Logo mark */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16a34a] shadow-lg shadow-[#16a34a]/30">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 2V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                <path d="M4 7L20 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
              </svg>
            </div>
          </div>

          {/* Brand name */}
          <div className="space-y-1">
            <p className="text-[11px] tracking-[0.35em] text-[#16a34a]/70 uppercase font-medium">
              Cloud Storage Platform
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              SyncSecure
            </h2>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full max-w-[200px]">
            <div className="flex-1 h-px bg-white/10" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a]/60" />
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-snug text-white">
              Your digital vault.<br />
              <span className="text-[#4ade80]">Secured.</span>
            </h1>
            <p className="text-sm leading-relaxed text-[#94a3b8] font-normal">
              Store, organise, and share your files with the confidence of
              bank-grade security and a clean, modern experience.
            </p>
          </div>

          {/* Bottom tag */}
          <div className="pt-2 border-t border-white/10 w-full">
            <p className="text-[10px] tracking-[0.25em] text-white/30 uppercase">
              Privacy · Security · Trust
            </p>
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex flex-1 flex-col items-center bg-[#f8fafc] p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-1.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16a34a] shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#0f172a] tracking-tight">SyncSecure</span>
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;

const skeletonPulse = 'animate-pulse rounded-md bg-slate-200';

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando dashboard">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`${skeletonPulse} h-8 w-48`} />
          <div className={`${skeletonPulse} h-4 w-72`} />
        </div>
        <div className="flex gap-2">
          <div className={`${skeletonPulse} h-9 w-36`} />
          <div className={`${skeletonPulse} h-9 w-32`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className={`${skeletonPulse} h-4 w-28`} />
            <div className={`${skeletonPulse} mt-3 h-8 w-16`} />
            <div className={`${skeletonPulse} mt-2 h-3 w-36`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <div className={`${skeletonPulse} h-5 w-40`} />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`${skeletonPulse} h-10 w-10 rounded-full`} />
                <div className="flex-1 space-y-2">
                  <div className={`${skeletonPulse} h-4 w-40`} />
                  <div className={`${skeletonPulse} h-3 w-28`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className={`${skeletonPulse} h-5 w-36`} />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${skeletonPulse} h-14 w-full`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

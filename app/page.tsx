import type { Metadata } from 'next';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardPlus,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Software para consultorios odontológicos',
  description:
    'Organiza citas, historias clínicas y equipos de uno o varios consultorios odontológicos con Dental Clinic.',
};

const workflow = [
  {
    icon: CalendarDays,
    title: 'Recepción organiza la agenda',
    description: 'Registra pacientes, asigna las citas a cada odontólogo y carga historias externas en PDF.',
  },
  {
    icon: ClipboardPlus,
    title: 'Odontología registra la atención',
    description: 'Consulta antecedentes, registra evoluciones en el expediente y actualiza el odontograma.',
  },
  {
    icon: Stethoscope,
    title: 'Cada odontólogo consulta sus reportes',
    description: 'Descarga tus reportes de citas y guarda informes en PDF en el expediente del paciente.',
  },
];

const loginClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#07534d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#063b36]';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#fcfbf7] text-[#102a26]">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="border-b border-[#d7e1da]">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
          <div className="inline-flex min-h-11 items-center gap-2.5 font-bold">
            <span className="grid size-9 place-items-center rounded-lg bg-[#07534d] text-white">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <span>Dental Clinic</span>
          </div>
          <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#funciones" className="inline-flex min-h-11 items-center hover:underline">Funciones</a>
            <a href="#consultorios" className="inline-flex min-h-11 items-center hover:underline">Consultorios</a>
          </nav>
          <a href="/login" className={loginClassName}>Iniciar sesión</a>
        </div>
      </header>

      <main id="contenido" className="flex-1" tabIndex={-1}>
        <section aria-labelledby="landing-title" className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:px-12 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#276259]">
              Software para consultorios odontológicos
            </p>
            <h1 id="landing-title" className="mt-4 max-w-[12ch] text-[clamp(2.65rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
              Tu consultorio dental, <span className="text-[#08766a]">en orden.</span>
            </h1>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-[#3e5a51] sm:text-lg">
              Coordina la agenda, consulta expedientes y gestiona el equipo de uno o varios consultorios desde un mismo sistema.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 sm:mt-8">
              <a href="/login" className={loginClassName}>
                Iniciar sesión <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a href="#funciones" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline">
                Ver funciones <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          {/* The WebP variants are pre-encoded and served directly to avoid runtime image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/consultorio-1280.webp"
            srcSet="/landing/consultorio-640.webp 640w, /landing/consultorio-768.webp 768w, /landing/consultorio-1280.webp 1280w"
            sizes="(min-width: 1280px) 620px, (min-width: 1024px) 51vw, 92vw"
            width={1280}
            height={960}
            fetchPriority="high"
            alt="Odontóloga organizando su jornada desde un computador en el consultorio"
            className="aspect-[4/3] h-auto w-full rounded-2xl bg-[#e2e9df] object-cover sm:rounded-3xl"
          />
        </section>

        <section id="funciones" aria-labelledby="workflow-title" className="scroll-mt-6 border-y border-[#d7e1da] bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">
            <div>
              <h2 id="workflow-title" className="max-w-[20ch] text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                De la primera cita al expediente clínico
              </h2>
              <ul className="mt-6 divide-y divide-[#d7e1da]">
                {workflow.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="grid grid-cols-[auto_1fr] gap-3 py-4">
                    <Icon className="mt-0.5 size-5 text-[#08766a]" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#3e5a51] sm:text-base">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/recepcion-1280.webp"
              srcSet="/landing/recepcion-640.webp 640w, /landing/recepcion-768.webp 768w, /landing/recepcion-1280.webp 1280w"
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 92vw"
              width={1280}
              height={960}
              loading="lazy"
              decoding="async"
              alt="Una recepcionista y un odontólogo revisan juntos la agenda del consultorio"
              className="aspect-[4/3] h-auto w-full rounded-2xl bg-[#e2e9df] object-cover sm:rounded-3xl"
            />
          </div>
        </section>

        <section id="consultorios" aria-labelledby="clinics-title" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid items-start gap-8 rounded-2xl bg-[#e8f0e9] p-6 sm:p-9 lg:grid-cols-2 lg:gap-16 lg:p-12">
            <div>
              <Building2 className="size-7 text-[#07534d]" aria-hidden="true" />
              <h2 id="clinics-title" className="mt-4 max-w-[18ch] text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                Varios consultorios. Un panel de administración.
              </h2>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-[#3e5a51]">
                Da de alta consultorios, administra su personal y lleva el control de sus suscripciones.
              </p>
            </div>
            <dl className="grid gap-5 lg:pt-3">
              <div>
                <dt className="flex items-center gap-2 font-semibold"><UsersRound className="size-5 text-[#07534d]" aria-hidden="true" />Acceso según el rol</dt>
                <dd className="mt-1 leading-relaxed text-[#3e5a51]">Cada persona ve las tareas de recepción, atención clínica o administración que le corresponden.</dd>
              </div>
              <div className="border-t border-[#b9cdc0] pt-5">
                <dt className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-[#07534d]" aria-hidden="true" />Datos separados por consultorio</dt>
                <dd className="mt-1 leading-relaxed text-[#3e5a51]">Los pacientes y expedientes de cada consultorio permanecen dentro de su propio espacio.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section aria-labelledby="login-title" className="border-t border-[#d7e1da] bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-9 sm:px-8 lg:px-12">
            <div>
              <h2 id="login-title" className="text-2xl font-semibold tracking-tight">Accede a tu consultorio</h2>
              <p className="mt-1 text-sm text-[#3e5a51]">Entra con la cuenta que te asignó tu administrador.</p>
            </div>
            <a href="/login" className={loginClassName}>
              Iniciar sesión <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d7e1da]">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-5 text-sm text-[#3e5a51] sm:px-8 lg:px-12">
          <span className="font-semibold">Dental Clinic</span>
          <span>Cúcuta, Colombia</span>
        </div>
      </footer>
    </div>
  );
}

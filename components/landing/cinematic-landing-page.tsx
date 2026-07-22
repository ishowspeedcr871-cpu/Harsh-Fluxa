"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Layers3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
  ["Contact", "#contact"],
] as const;

const features = [
  {
    Icon: ShieldCheck,
    title: "Tenant-safe by design",
    copy: "Authentication, organization context and RBAC protect every operational workflow.",
  },
  {
    Icon: FileUp,
    title: "Premium upload intake",
    copy: "A guided customer upload flow captures files, print configuration and validation state.",
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp-ready",
    copy: "Provider-neutral foundations prepare FLUXA for conversational print intake.",
  },
  {
    Icon: Layers3,
    title: "Operational command",
    copy: "Customer, employee and organization portals share one elegant system.",
  },
];

const faqs = [
  [
    "Is FLUXA multi-tenant?",
    "Yes. Every print job, member, notification and portal surface is scoped to the active organization.",
  ],
  [
    "Can customers upload from mobile?",
    "Phase 12 introduces a responsive upload workspace with drag/drop, previews and configuration.",
  ],
  [
    "Is WhatsApp vendor-specific?",
    "No. The foundation normalizes providers behind replaceable adapter interfaces.",
  ],
];

function FloatingParticles() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 26 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute size-1 rounded-full bg-white/40 shadow-cyan"
          style={{ left: `${(index * 37) % 100}%`, top: `${(index * 19) % 100}%` }}
          animate={reduceMotion ? undefined : { y: [0, -18, 12, 0], opacity: [0.15, 0.7, 0.25] }}
          transition={{
            duration: 8 + (index % 7),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.16,
          }}
        />
      ))}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductPreview() {
  return (
    <motion.div
      className="relative mx-auto mt-14 max-w-5xl"
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.25 }}
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-r from-accent-cyan/20 via-white/5 to-accent-magenta/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-black/50 p-4 shadow-glass backdrop-blur-2xl">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Live queue</span>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">
                Operational
              </span>
            </div>
            {[
              ["Investor deck", "VALIDATING", "74%"],
              ["Campus posters", "PRINTING", "41%"],
              ["Legal bundle", "READY", "100%"],
            ].map(([name, status, width]) => (
              <div key={name} className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-accent-cyan">{status}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta"
                    style={{ width }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-muted-foreground">Tenant volume</p>
              <p className="mt-2 text-4xl font-semibold">18.4k</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-muted-foreground">Upload channels</p>
              <p className="mt-2 text-2xl font-semibold">Web · Portal · WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CinematicLandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.22),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(217,70,239,.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.06),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.08),transparent)] opacity-30" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <FloatingParticles />
      <nav className="fixed left-1/2 top-4 z-50 flex w-[min(94vw,1080px)] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-black/50 px-4 py-3 shadow-glass backdrop-blur-2xl">
        <Link href="#home" className="font-semibold tracking-[0.3em] text-accent-cyan">
          FLUXA
        </Link>
        <div className="hidden gap-5 text-sm text-muted-foreground md:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-foreground">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Link
            href="/customer"
            className="rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            Customer Portal
          </Link>
          <Link
            href="/organization"
            className="hidden rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta px-3 py-2 text-sm font-medium text-black md:inline-flex"
          >
            Organization Portal
          </Link>
        </div>
      </nav>

      <section id="home" className="relative px-4 pb-28 pt-36 md:pt-44">
        <Reveal>
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl">
              <Sparkles className="size-4 text-accent-cyan" /> Enterprise print operations,
              cinematic by default
            </div>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
              The premium command layer for{" "}
              <span className="bg-gradient-to-r from-accent-cyan via-white to-accent-magenta bg-clip-text text-transparent">
                modern print teams.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              FLUXA unifies customer uploads, employee queues, secure collection, analytics and
              platform administration in a floating multi-tenant operating system.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/customer/jobs/new">
                <Button size="lg">
                  Start an upload <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Enter workspace
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
        <ProductPreview />
      </section>

      <section
        id="features"
        className="relative mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-2 lg:grid-cols-4"
      >
        {features.map(({ Icon, title, copy }, index) => (
          <Reveal key={title} delay={index * 0.08}>
            <Card className="h-full transition hover:-translate-y-2 hover:border-accent-cyan/30">
              <CardHeader>
                <Icon className="mb-4 size-8 text-accent-cyan" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{copy}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-2">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Product overview</CardTitle>
              <CardDescription>
                One platform for customers, employees and organization operators.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {[
                "Customer upload portal",
                "Employee print queue",
                "OTP collection security",
                "Reports and analytics",
                "Global platform administration",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" />
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Why FLUXA</CardTitle>
              <CardDescription>
                Designed for premium print operators who need tenant isolation, speed and trust from
                day one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent-cyan/15 to-accent-magenta/15 p-8">
                <Zap className="mb-4 size-10 text-accent-magenta" />
                <p className="text-2xl font-semibold">
                  Operational elegance for every upload, queue decision and pickup moment.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Upload workflow</CardTitle>
              <CardDescription>
                From website upload to WhatsApp media intake, FLUXA captures configuration,
                validates files, and creates traceable print jobs.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              {["Upload", "Configure", "Validate", "Track"].map((step, index) => (
                <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-accent-cyan">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold">{step}</h3>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-3">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Screenshots showcase</CardTitle>
              <CardDescription>
                Floating dashboard, queue and upload surfaces are represented through live glass UI.
              </CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card id="pricing">
            <CardHeader>
              <CardTitle>Pricing foundation</CardTitle>
              <CardDescription>
                Enterprise plans, usage-based storage and premium support foundations are ready for
                billing integration.
              </CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
        <Reveal delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>
                “FLUXA feels like the control room our print operation was missing.”
              </CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-20">
        <Reveal>
          <h2 className="mb-8 text-center text-4xl font-semibold">Questions, answered.</h2>
        </Reveal>
        <div className="grid gap-4">
          {faqs.map(([question, answer]) => (
            <Reveal key={question}>
              <Card>
                <CardHeader>
                  <CardTitle>{question}</CardTitle>
                  <CardDescription>{answer}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <footer id="contact" className="relative mx-auto max-w-7xl px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Bring cinematic print operations to your organization.</CardTitle>
            <CardDescription>
              Contact FLUXA to activate an enterprise workspace, customer portal and WhatsApp-ready
              intake foundation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center gap-3">
            <Link href="mailto:hello@fluxa.example">
              <Button>Contact sales</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          © 2026 FLUXA. Premium multi-tenant print management.
        </p>
      </footer>
    </main>
  );
}

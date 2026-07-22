export function RootBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-accent-cyan/20 blur-[140px]" />
      <div className="absolute -bottom-48 -right-40 size-[38rem] rounded-full bg-accent-magenta/20 blur-[150px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.08),transparent_35%)]" />
    </div>
  );
}

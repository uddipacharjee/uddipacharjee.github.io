import { navLinks, profile } from "@/data/resume";

export default function Nav() {
  return (
    <header className="shell flex h-16 items-center justify-end gap-6 sm:justify-between md:h-20">
      {/* The hero repeats the name right below, so phones skip it here. */}
      <a href="/" className="hidden text-[15px] font-semibold text-ink sm:block">
        {profile.name}
      </a>

      <nav aria-label="Site">
        <ul className="flex items-center gap-6 text-[15px] text-muted">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

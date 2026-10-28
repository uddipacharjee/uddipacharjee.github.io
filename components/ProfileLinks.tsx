import { profile, socials } from "@/data/resume";

type ProfileLink = { label: string; href: string };

/** Every contact or profile link that is filled in, in order. */
const links: ProfileLink[] = [
  { label: "GitHub", href: socials.github },
  ...(socials.linkedin ? [{ label: "LinkedIn", href: socials.linkedin }] : []),
  ...(profile.email
    ? [{ label: profile.email, href: `mailto:${profile.email}` }]
    : []),
  ...(profile.resumeFile
    ? [{ label: "Résumé (PDF)", href: profile.resumeFile }]
    : []),
];

export default function ProfileLinks({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {links.map(({ label, href }) => {
        const external = href.startsWith("http");
        return (
          <li key={href}>
            <a
              href={href}
              className="link"
              {...(external && { target: "_blank", rel: "noreferrer noopener" })}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

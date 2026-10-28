import type { CSSProperties } from "react";
import Image from "next/image";
import { profile } from "@/data/resume";
import ProfileLinks from "./ProfileLinks";

/** Staggers the `.rise` entrance; see globals.css. */
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="pb-20 pt-12 md:pb-28 md:pt-24">
      <div className="shell">
        {profile.photo && (
          <Image
            src={profile.photo}
            alt={profile.name}
            width={96}
            height={96}
            priority
            className="rise size-20 rounded-full object-cover md:size-24"
          />
        )}

        <h1
          className="rise mt-10 text-balance text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.025em] font-stretch-condensed sm:text-7xl md:mt-12 lg:text-[7.25rem]"
          style={delay(90)}
        >
          {profile.name}
        </h1>

        <p
          className="rise mt-8 max-w-[34ch] text-xl leading-snug text-muted md:mt-10 md:text-[1.6rem]"
          style={delay(180)}
        >
          {profile.intro}
        </p>

        <div className="rise" style={delay(270)}>
          <ProfileLinks className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[17px] font-medium text-ink md:mt-12" />
        </div>
      </div>
    </section>
  );
}

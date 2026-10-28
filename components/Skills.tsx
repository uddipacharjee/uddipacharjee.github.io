import type { CSSProperties } from "react";
import { skillLayers, tooling } from "@/data/resume";
import Section from "./Section";

/** Accent mixed into the top band, and how much more each band below adds. */
const DEPTH_START = 4;
const DEPTH_STEP = 3.5;

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <p className="max-w-[56ch] text-[17px] leading-[1.7] md:text-lg">
        Grouped by where they sit in a service, from the API other systems
        call down to the runtime underneath.
      </p>

      <ol className="mt-10 overflow-hidden rounded-xl">
        {skillLayers.map((layer, i) => (
          <li
            key={layer.name}
            className="stratum grid gap-x-8 gap-y-3 px-5 py-6 md:grid-cols-[12rem_minmax(0,1fr)] md:px-7 md:py-7"
            style={
              {
                "--depth": `${DEPTH_START + i * DEPTH_STEP}%`,
              } as CSSProperties
            }
          >
            <div>
              <h3 className="font-semibold text-ink">{layer.name}</h3>
              <p className="mt-0.5 text-sm text-muted">{layer.role}</p>
            </div>
            <ul className="flex flex-wrap content-start gap-x-6 gap-y-1.5 text-ink md:pt-px">
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* Same grid as a band, but untinted: tooling wraps the stack rather than sitting in it. */}
      <div className="mt-6 grid gap-x-8 gap-y-3 px-5 py-6 md:grid-cols-[12rem_minmax(0,1fr)] md:px-7">
        <div>
          <h3 className="font-semibold text-ink">Around the code</h3>
          <p className="mt-0.5 text-sm text-muted">Build, test and ship</p>
        </div>
        <ul className="flex flex-wrap content-start gap-x-6 gap-y-1.5 text-ink md:pt-px">
          {tooling.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

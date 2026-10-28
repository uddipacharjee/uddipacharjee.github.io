import Image from "next/image";

type FigureProps = {
  /** Under public/, e.g. "/blogs/<slug>/diagram.svg". */
  src: string;
  /** Says what the image shows; search engines index images by it. */
  alt: string;
  /** Intrinsic size of the image (an SVG's viewBox); it is scaled to the column. */
  width: number;
  height: number;
  caption?: string;
};

/**
 * An image or diagram in a post. Diagrams are scaled down to the text
 * column, which can make labels small on phones, so the image links to the
 * file itself to be opened full size.
 */
export default function Figure({ src, alt, width, height, caption }: FigureProps) {
  return (
    <figure>
      <a href={src} target="_blank" rel="noopener" className="block">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full rounded-lg border border-rule"
        />
      </a>
      {caption && (
        <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}

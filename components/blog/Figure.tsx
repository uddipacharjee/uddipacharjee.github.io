import Image from "next/image";

type FigureProps = {
  /** Under public/, e.g. "/blogs/<slug>/diagram.png". */
  src: string;
  alt: string;
  /** Intrinsic size of the image file; it is scaled to the column width. */
  width: number;
  height: number;
  caption?: string;
};

export default function Figure({ src, alt, width, height, caption }: FigureProps) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full rounded-lg border border-rule"
      />
      {caption && (
        <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}

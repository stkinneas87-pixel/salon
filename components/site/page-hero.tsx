import type { ImageRef } from "@/lib/content/schemas";

import { ParallaxMedia } from "./parallax-media";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  priority = true,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: ImageRef;
  imageAlt?: string;
  priority?: boolean;
}) {
  return (
    <section className="grid border-b border-line lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex items-end">
        <div className="container-editorial w-full pt-24 pb-14 lg:pt-32 lg:pb-20">
          <p className="label text-muted">{eyebrow}</p>
          <h1 className="display mt-8 max-w-3xl text-[clamp(3.4rem,7.5vw,8rem)]">
            {title}
          </h1>
          {intro ? (
            <p className="pretty mt-8 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      <ParallaxMedia
        src={image.src}
        alt={imageAlt || image.alt}
        className="min-h-[52vh] lg:min-h-[70vh]"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority={priority}
        speed={0.07}
      />
    </section>
  );
}

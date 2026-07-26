import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import hero1 from "../../assets/hero/hero1.jpg";
import hero2 from "../../assets/hero/hero2.jpg";
import hero3 from "../../assets/hero/hero3.jpg";
import hero4 from "../../assets/hero/hero4.jpg";

const slides = [
  {
    id: 1,
    image: hero1,
    subtitle: "NEW ARRIVAL",
    title: "Premium Streetwear",
    description:
      "Modern essentials crafted for everyday comfort with premium quality fabrics.",
    button: "Shop Now",
  },
  {
    id: 2,
    image: hero2,
    subtitle: "SUMMER COLLECTION",
    title: "Minimal. Modern.",
    description:
      "Clean silhouettes designed to elevate your everyday wardrobe.",
    button: "Explore",
  },
  {
    id: 3,
    image: hero3,
    subtitle: "LIMITED DROP",
    title: "Own Your Style",
    description:
      "Wear confidence with timeless streetwear made for every season.",
    button: "Discover",
  },
  {
    id: 4,
    image: hero4,
    subtitle: "WEARIT",
    title: "Dress Better.",
    description:
      "Fashion that speaks before you do.",
    button: "Shop Collection",
  },
];

export default function Hero() {

  const autoplay = Autoplay({
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [autoplay]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(
        emblaApi.selectedScrollSnap()
      );
    };

    emblaApi.on("select", onSelect);

    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);
  return (
    <section className="relative overflow-hidden">

      <div
        ref={emblaRef}
        className="overflow-hidden"
      >
        <div className="flex">

          {slides.map((slide) => (

            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
            >

              {/* Background Image */}

              <img
                src={slide.image}
                alt={slide.title}
                className="
                  h-[80vh]
                  w-full
                  object-cover
                  lg:h-screen
                  scale-110
                  duration-[2000ms]
                "
              />

              {/* Overlay */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-black/80
                  via-black/35
                  to-black/5
                "
              />

              {/* Content */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                "
              >

                <div className="mx-auto w-full max-w-7xl px-6">

                  <div className="max-w-xl text-white">

                    <p
                      className="
                        mb-5
                        text-sm
                        uppercase
                        tracking-[0.4em]
                        text-zinc-300
                      "
                    >
                      {slide.subtitle}
                    </p>

                    <h1
                      className="
                        text-4xl
                        font-black
                        leading-tight
                        sm:text-5xl
                        lg:text-7xl
                      "
                    >
                      {slide.title}
                    </h1>

                    <p
                      className="
                        mt-8
                        max-w-lg
                        text-base
                        leading-8
                        text-zinc-200
                        lg:text-lg
                      "
                    >
                      {slide.description}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                      <Link
                        to="/products"
                        className="
                          flex
                          h-14
                          items-center
                          rounded-xl
                          border
                          border-white/40
                          bg-white/10
                          px-8
                          text-white
                          backdrop-blur-md
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-2xl
                        "
                      >
                        {slide.button}
                      </Link>

                    </div>

                  </div>

                </div>

              </div>
                            {/* Desktop Previous */}

              <button
                onClick={scrollPrev}
                className="
                  absolute
                  left-8
                  top-1/2
                  z-20
                  hidden
                  h-14
                  w-14
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:bg-white
                  hover:text-black
                  lg:flex
                "
              >
                <ArrowLeft size={22} />
              </button>

              {/* Desktop Next */}

              <button
                onClick={scrollNext}
                className="
                  absolute
                  right-8
                  top-1/2
                  z-20
                  hidden
                  h-14
                  w-14
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:bg-white
                  hover:text-black
                  lg:flex
                "
              >
                <ArrowRight size={22} />
              </button>

            </div>

          ))}

        </div>

      </div>

      {/* Bottom Dots */}

      <div
        className="
          absolute
          bottom-8
          left-1/2
          z-30
          flex
          -translate-x-1/2
          gap-3
        "
      >
        {slides.map((_, index) => (

          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`
              rounded-full
              transition-all
              duration-300

              ${
                selectedIndex === index
                  ? "h-2.5 w-10 bg-white"
                  : "h-2.5 w-2.5 bg-white/40"
              }
            `}
          />

        ))}
      </div>

    </section>
  );
}
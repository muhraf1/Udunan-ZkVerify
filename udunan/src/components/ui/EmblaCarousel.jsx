import React, { useCallback } from "react";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import useEmblaCarousel from "embla-carousel-react";
import { Progress } from "@/components/ui/progress";
import { donations } from "@/data/donations";
import { Heart } from "lucide-react";

export const EmblaCarousel = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  // Calculate progress percentage
  const calculateProgress = useCallback((currentAmount, targetAmount) => {
    return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  }, []);

  return (
    <section className="embla max-w-4xl mx-auto">
      <div className="embla__viewport rounded-lg" ref={emblaRef}>
        <div className="embla__container">
          {donations.map((donation, index) => {
            // Calculate progress percentage
            const progressPercentage = calculateProgress(
              donation.currentAmount,
              donation.targetAmount
            );

            return (
              <div className="embla__slide" key={index}>
                <div className="w-full ">
                  <img
                    src={donation.imageSrc}
                    alt={donation.title}
                    className="w-full h-fit object-cover rounded-md"
                  />
                  <div className="absolute bottom-0 right-0 w-3/4 px-4 sm:px-6 backdrop-blur bg-black/75 p-2 rounded-tl-md rounded-br-md z-10">
                    <div className="flex flex-col md:flex-row text-sm justify-between mt-1 text-white w-full items-start md:items-center">
                      <h2 className="text-base sm:text-lg font-bold text-left text-white">
                        {donation.title}
                      </h2>
                      <span className="flex items-center gap-1 text-xs mt-2 md:mt-0">
                        <span className="font-bold text-sm sm:text-base">
                          ${donation.currentAmount.toLocaleString()}
                        </span>
                        <span className="font-light text-xs sm:text-sm">From</span>
                        ${donation.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={progressPercentage}
                        className="w-full"
                        indicatorClassName="bg-[#5794D1]"
                      />
                    </div>
                    <div className="flex flex-col md:flex-row text-xs justify-between mt-2 mb-2 text-white">
                      <span className="flex items-center gap-1 mb-2 md:mb-0">
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5" stroke="#5794D1" />
                        <span className="font-extrabold">{donation.donationCount}</span>
                        <span className="hidden sm:inline">Donations</span>
                      </span>
                      <span className="text-right">{donation.daysLeft} Days Left</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="embla__controls mt-2">
        <div className="embla__dots flex justify-center">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`embla__dot w-2 h-2 rounded-full bg-gray-300 ${index === selectedIndex ? "embla__dot--selected" : ""
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;

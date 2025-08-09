import { useCarousel } from '@/hooks/useCarousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

export const HeroCarousel = () => {
  const { slides, loading } = useCarousel();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full h-64 bg-muted animate-pulse">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!slides.length) {
    return null;
  }

  const handleSlideClick = (linkUrl: string | null) => {
    if (linkUrl) {
      navigate(linkUrl);
    }
  };

  return (
    <div className="w-full relative">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <h2 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">
                        {slide.title}
                      </h2>
                      {slide.description && (
                        <p className="text-lg md:text-xl mb-6 opacity-90 animate-fade-in">
                          {slide.description}
                        </p>
                      )}
                      {slide.button_text && slide.link_url && (
                        <Button
                          onClick={() => handleSlideClick(slide.link_url)}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-lg animate-scale-in"
                        >
                          {slide.button_text}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
        <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
      </Carousel>
    </div>
  );
};
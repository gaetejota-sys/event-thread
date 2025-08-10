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
import { useState } from 'react';

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

  const ParallaxSlide = ({ slide }: { slide: any }) => {
    const [transform, setTransform] = useState<string>('translate3d(0,0,0) scale(1.05)');
    const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const max = 8;
      const tx = -(relX * max);
      const ty = -(relY * max);
      setTransform(`translate3d(${tx}px, ${ty}px, 0) scale(1.05)`);
    };
    const handleLeave = () => setTransform('translate3d(0,0,0) scale(1.05)');

    return (
      <div className="relative h-64 overflow-hidden" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <img
          src={slide.image_url}
          alt={slide.title}
          className="w-full h-full object-cover will-change-transform"
          style={{ transform, transition: 'transform 300ms ease-out' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in" style={{ animationDelay: '0ms' }}>
                {slide.title}
              </h2>
              {slide.description && (
                <p className="text-lg md:text-xl mb-6 opacity-90 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  {slide.description}
                </p>
              )}
              {slide.button_text && slide.link_url && (
                <Button
                  onClick={() => handleSlideClick(slide.link_url)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-lg animate-scale-in"
                  style={{ animationDelay: '180ms' }}
                >
                  {slide.button_text}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative hidden md:block">
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
              <ParallaxSlide slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
        <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
      </Carousel>
    </div>
  );
};
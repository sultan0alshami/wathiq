import * as React from "react";

const MOBILE_BREAKPOINT = 768; // md breakpoint - mobile phones
const TABLET_BREAKPOINT = 1024; // lg breakpoint - tablets and up

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      console.log('[useIsMobile] Screen width:', width, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return !!isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth;
      const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      console.log('[useIsTablet] Screen width:', width, 'isTablet:', tablet);
      setIsTablet(tablet);
    };

    checkIsTablet();
    window.addEventListener('resize', checkIsTablet);
    return () => window.removeEventListener('resize', checkIsTablet);
  }, []);

  return !!isTablet;
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<{
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  }>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isDesktop = width >= TABLET_BREAKPOINT;
      
      console.log('[useScreenSize] Width:', width, 'Height:', height, 'Mobile:', isMobile, 'Tablet:', isTablet, 'Desktop:', isDesktop);
      
      setScreenSize({ width, height, isMobile, isTablet, isDesktop });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

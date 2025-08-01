import { useEffect, useState } from 'react';

const useThemeLogo = () => {
  const defaultLogo = process.env.REACT_APP_LIGHT_LOGO_URL;
  const [logoUrl, setLogoUrl] = useState(defaultLogo);

  useEffect(() => {
    const darkLogoUrl = process.env.REACT_APP_DARK_LOGO_URL;
    const lightLogoUrl = process.env.REACT_APP_LIGHT_LOGO_URL;

    const checkTheme = () => {
      const bodyClasses = document.body.classList;
      const isDarkTheme =
        bodyClasses.contains('theme-default') ||
        bodyClasses.contains('theme-contrast');
      const isSystemTheme = bodyClasses.contains('theme-system');

      if (isSystemTheme) {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches;

        if (prefersDark && darkLogoUrl) {
          setLogoUrl(darkLogoUrl);
        } else {
          setLogoUrl(lightLogoUrl);
        }
        return;
      }

      if (isDarkTheme && darkLogoUrl) {
        setLogoUrl(darkLogoUrl);
      } else {
        setLogoUrl(lightLogoUrl);
      }
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          checkTheme();
          break;
        }
      }
    });

    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (document.body.classList.contains('theme-system')) {
        checkTheme();
      }
    };
    systemThemeQuery.addListener(handleSystemThemeChange);

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
      systemThemeQuery.removeListener(handleSystemThemeChange);
    };
  }, []);

  return logoUrl;
};

export const WordmarkLogo: React.FC = () => {
  const logoUrl = useThemeLogo();
  return (
    <img src={logoUrl} alt={window.APP_NAME} className='logo logo--wordmark' />
  );
};

export const IconLogo: React.FC = () => {
  const logoUrl = useThemeLogo();
  return (
    <img src={logoUrl} alt={window.APP_NAME} className='logo logo--icon' />
  );
};

export const SymbolLogo: React.FC = () => {
  const logoUrl = useThemeLogo();
  return (
    <img src={logoUrl} alt={window.APP_NAME} className='logo logo--icon' />
  );
};

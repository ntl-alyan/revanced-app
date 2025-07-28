import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

// Extremely simplified version - just English + current language to prevent hook issues
export function LanguageSelector() {
  const [, navigate] = useLocation();
  
  // Get current language code from URL
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const currentLangCode = pathParts.length > 0 ? pathParts[0] : 'en';
  
  // Only query for all languages
  const { datas, isLoading } = useQuery({
    queryKey: ['/api/languages'],
    staleTime: 300000,
    gcTime: 600000,
    queryFn: async () => {
      const response = await fetch('/api/languages?active=true');
      if (!response.ok) throw new Error('Failed to fetch languages');
      return response.json();
    },
  });
  
  // Show loading state
  if (isLoading || !languages) {
    return (
      <div className="relative w-[180px]">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  // Filter to English and currently selected language only
  const defaultLanguage = languages.find((lang) => lang.isDefault) || languages[0];
  const currentLanguage = languages.find((lang) => lang.code === currentLangCode) || defaultLanguage;
  
  // Just show the two languages to avoid excessive API calls
  const displayLanguages = languages.filter((lang) => 
    lang.isDefault || lang.code === currentLangCode
  ).sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Handle language change
  const handleLanguageChange = (langCode) => {
    if (window.location.pathname.includes('/download/')) return;
    
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const isDefaultLanguage = langCode === "en" || langCode === defaultLanguage?.code;
    const firstPartIsLanguage = languages.some((lang) => lang.code === pathParts[0]);
    
    // Root path case
    if (pathParts.length === 0) {
      navigate(isDefaultLanguage ? '/' : `/${langCode}`);
      return;
    }
    
    // Language code in URL case
    if (firstPartIsLanguage) {
      const routeParts = pathParts.slice(1);
      navigate(isDefaultLanguage 
        ? '/' + routeParts.join('/') 
        : '/' + langCode + '/' + routeParts.join('/')
      );
    } else {
      // No language in URL
      navigate(isDefaultLanguage
        ? '/' + pathParts.join('/')
        : '/' + langCode + '/' + pathParts.join('/')
      );
    }
  };
  
  return (
    <Select value={currentLanguage?.code} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span>{currentLanguage?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {displayLanguages.map((language) => (
            <SelectItem key={language.id} value={language.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
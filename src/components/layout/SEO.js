// components/SEO.js
import { NextSeo } from 'next-seo';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogUrl, 
  ogType,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage
}) {
  return (
    <NextSeo
      title={title}
      description={description}
      keywords={keywords}
      openGraph={{
        title: ogTitle,
        description: ogDescription,
        url: ogUrl,
        type: ogType,
        images: ogImage ? [{ url: ogImage }] : undefined,
      }}
      twitter={{
        cardType: twitterCard,
        title: twitterTitle,
        description: twitterDescription,
        image: twitterImage,
      }}
    />
  );
}
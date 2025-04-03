import React from "react";
import { Helmet } from "react-helmet-async";

export interface MetaTagsProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  canonicalUrl,
  keywords,
  ogType = "website",
  ogImage,
  twitterCard = "summary_large_image",
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
}) => {
  const siteUrl = window.location.origin;
  const fullCanonicalUrl = `${siteUrl}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content="Paysurity" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Article Specific Meta Tags */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {articleAuthor && <meta property="article:author" content={articleAuthor} />}
    </Helmet>
  );
};
import React, { useEffect, useState } from "react";
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
  // Use state to avoid rendering issues with window access during SSR
  const [fullCanonicalUrl, setFullCanonicalUrl] = useState("");
  
  useEffect(() => {
    try {
      const siteUrl = window.location.origin;
      setFullCanonicalUrl(`${siteUrl}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`);
    } catch (error) {
      console.error("Error setting canonical URL:", error);
      setFullCanonicalUrl(canonicalUrl);
    }
  }, [canonicalUrl]);
  
  // If canonical URL isn't set yet, return null to avoid rendering issues
  if (!fullCanonicalUrl) {
    return null;
  }
  
  try {
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
  } catch (error) {
    console.error("Error rendering MetaTags component:", error);
    // Return null instead of throwing, which would cause the entire app to crash
    return null;
  }
};
import React from "react";
import { Helmet } from "react-helmet-async";

interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

// Organization schema
export const OrganizationSchema: React.FC = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Paysurity",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo192.png`,
    "sameAs": [
      "https://twitter.com/paysurity",
      "https://www.facebook.com/paysurity",
      "https://www.linkedin.com/company/paysurity"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-123-4567",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    }
  };
  
  return <JsonLd data={data} />;
};

// Blog post schema
interface BlogPostSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishDate: string;
  modifiedDate?: string;
  authorName?: string;
}

export const BlogPostSchema: React.FC<BlogPostSchemaProps> = ({
  title,
  description,
  url,
  imageUrl,
  publishDate,
  modifiedDate,
  authorName = "Paysurity Team"
}) => {
  const siteUrl = window.location.origin;
  const fullUrl = `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
  
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": imageUrl || `${siteUrl}/logo192.png`,
    "url": fullUrl,
    "datePublished": publishDate,
    "dateModified": modifiedDate || publishDate,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Paysurity",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  };
  
  return <JsonLd data={data} />;
};

// FAQ schema
interface FAQSchemaProps {
  questions: Array<{ question: string; answer: string }>;
}

export const FAQSchema: React.FC<FAQSchemaProps> = ({ questions }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(({ question, answer }) => ({
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer
      }
    }))
  };
  
  return <JsonLd data={data} />;
};

// Product schema
interface ProductSchemaProps {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
  brand?: string;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  url,
  imageUrl,
  price,
  currency = "USD",
  brand = "Paysurity"
}) => {
  const siteUrl = window.location.origin;
  const fullUrl = `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
  
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": imageUrl || `${siteUrl}/logo192.png`,
    "url": fullUrl,
    "brand": {
      "@type": "Brand",
      "name": brand
    }
  };
  
  if (price) {
    Object.assign(data, {
      "offers": {
        "@type": "Offer",
        "priceCurrency": currency,
        "price": price,
        "availability": "https://schema.org/InStock"
      }
    });
  }
  
  return <JsonLd data={data} />;
};

// Breadcrumb schema
interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const siteUrl = window.location.origin;
  
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`
    }))
  };
  
  return <JsonLd data={data} />;
};
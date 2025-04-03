import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema: FC<BreadcrumbSchemaProps> = ({ items }) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://paysurity.com';
  
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbList)}
      </script>
    </Helmet>
  );
};

export const OrganizationSchema: FC = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Paysurity",
    "url": "https://paysurity.com",
    "logo": "https://paysurity.com/logo.png",
    "sameAs": [
      "https://twitter.com/paysurity",
      "https://www.facebook.com/paysurity",
      "https://www.linkedin.com/company/paysurity"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-PAY-SURITY",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};

export const BlogPostSchema: FC<{
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishDate: string;
  modifiedDate?: string;
  authorName?: string;
}> = ({ 
  title, 
  description, 
  url, 
  imageUrl, 
  publishDate, 
  modifiedDate,
  authorName = "Paysurity Team" 
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://paysurity.com';
  const fullUrl = `${siteUrl}${url}`;
  const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`) : undefined;

  const blogPostData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    },
    "headline": title,
    "description": description,
    "image": fullImageUrl,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Paysurity",
      "logo": {
        "@type": "ImageObject",
        "url": "https://paysurity.com/logo.png"
      }
    },
    "datePublished": publishDate,
    "dateModified": modifiedDate || publishDate
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(blogPostData)}
      </script>
    </Helmet>
  );
};

export const FAQSchema: FC<{
  questions: Array<{ question: string; answer: string; }>
}> = ({ questions }) => {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
    </Helmet>
  );
};

export const ProductSchema: FC<{
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
  availability?: string;
  brand?: string;
  reviewCount?: number;
  ratingValue?: number;
}> = ({
  name,
  description,
  url,
  imageUrl,
  price,
  currency = "USD",
  availability = "https://schema.org/InStock",
  brand = "Paysurity",
  reviewCount,
  ratingValue
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://paysurity.com';
  const fullUrl = `${siteUrl}${url}`;
  const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`) : undefined;

  const productData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": fullUrl,
    "brand": {
      "@type": "Brand",
      "name": brand
    }
  };

  if (fullImageUrl) {
    productData.image = fullImageUrl;
  }

  if (price) {
    productData.offers = {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": availability,
      "url": fullUrl
    };
  }

  if (reviewCount && ratingValue) {
    productData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productData)}
      </script>
    </Helmet>
  );
};
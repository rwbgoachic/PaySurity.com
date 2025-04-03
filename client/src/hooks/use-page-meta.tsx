import { MetaTags, BlogPostSchema, BreadcrumbSchema, FAQSchema, ProductSchema } from "@/components/seo";

/**
 * Hook to generate consistent page metadata
 * This centralizes our metadata and structured data management
 */
type UsePageMetaProps = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  // Optional article-specific fields
  isArticle?: boolean;
  articlePublishDate?: string;
  articleModifiedDate?: string;
  articleAuthor?: string;
  // Optional product-specific fields
  isProduct?: boolean;
  productName?: string;
  productPrice?: string;
  productCurrency?: string;
  productBrand?: string;
  // Optional FAQ data
  faqs?: Array<{ question: string; answer: string }>;
  // Optional breadcrumb items
  breadcrumbs?: Array<{ name: string; url: string }>;
};

export function usePageMeta({
  title,
  description,
  path,
  keywords,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  isArticle = false,
  articlePublishDate,
  articleModifiedDate,
  articleAuthor,
  isProduct = false,
  productName,
  productPrice,
  productCurrency,
  productBrand,
  faqs,
  breadcrumbs
}: UsePageMetaProps) {
  // Format the full title with site name
  const fullTitle = title.includes('Paysurity') ? title : `${title} | Paysurity`;
  
  return (
    <>
      {/* Base Meta Tags */}
      <MetaTags
        title={fullTitle}
        description={description}
        canonicalUrl={path}
        keywords={keywords}
        ogType={ogType}
        ogImage={ogImage}
        twitterCard={twitterCard}
        articlePublishedTime={isArticle ? articlePublishDate : undefined}
        articleModifiedTime={isArticle ? articleModifiedDate : undefined}
        articleAuthor={isArticle ? articleAuthor : undefined}
      />
      
      {/* Structured Data - Article */}
      {isArticle && articlePublishDate && (
        <BlogPostSchema
          title={title}
          description={description}
          url={path}
          imageUrl={ogImage}
          publishDate={articlePublishDate}
          modifiedDate={articleModifiedDate}
          authorName={articleAuthor}
        />
      )}
      
      {/* Structured Data - Product */}
      {isProduct && productName && (
        <ProductSchema
          name={productName}
          description={description}
          url={path}
          imageUrl={ogImage}
          price={productPrice}
          currency={productCurrency}
          brand={productBrand}
        />
      )}
      
      {/* Structured Data - FAQ */}
      {faqs && faqs.length > 0 && (
        <FAQSchema questions={faqs} />
      )}
      
      {/* Structured Data - Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbSchema items={breadcrumbs} />
      )}
    </>
  );
}
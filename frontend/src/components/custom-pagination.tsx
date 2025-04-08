'use client';

import { 
  Pagination as BasePagination, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationList, 
  PaginationPage, 
  PaginationGap 
} from './pagination';
import { useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  maxPages?: number;
}

export function Pagination({ 
  currentPage, 
  pageCount, 
  onPageChange, 
  maxPages = 5 
}: PaginationProps) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest('a[href^="?page="]');
      if (button && button instanceof HTMLAnchorElement) {
        e.preventDefault();
        const pageParam = new URLSearchParams(button.href.split('?')[1]).get('page');
        if (pageParam) {
          onPageChange(parseInt(pageParam, 10));
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onPageChange]);

  if (pageCount <= 1) return null;

  const pages = getVisiblePages(currentPage, pageCount, maxPages);

  return (
    <BasePagination>
      <PaginationPrevious 
        href={currentPage <= 1 ? null : `?page=${currentPage - 1}`}
      />
      
      <PaginationList>
        {pages.map((page, index) => {
          if (page === -1) {
            return <PaginationGap key={`gap-${index}`} />;
          }
          
          return (
            <PaginationPage
              key={page}
              href={`?page=${page}`}
              current={page === currentPage}
            >
              {page}
            </PaginationPage>
          );
        })}
      </PaginationList>
      
      <PaginationNext
        href={currentPage >= pageCount ? null : `?page=${currentPage + 1}`}
      />
    </BasePagination>
  );
}

function getVisiblePages(current: number, total: number, maxVisible: number): number[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const hasLeftSpill = current - 2 > 1;
  const hasRightSpill = current + 2 < total;

  if (!hasLeftSpill && hasRightSpill) {
    const leftPages = Array.from({ length: maxVisible - 1 }, (_, i) => i + 1);
    return [...leftPages, -1, total];
  } else if (hasLeftSpill && !hasRightSpill) {
    const rightPages = Array.from({ length: maxVisible - 1 }, (_, i) => total - i).reverse();
    return [1, -1, ...rightPages];
  } else if (hasLeftSpill && hasRightSpill) {
    const middlePages = Array.from(
      { length: Math.min(maxVisible - 4, 3) },
      (_, i) => current - Math.floor((maxVisible - 4) / 2) + i
    );
    return [1, -1, ...middlePages, -1, total];
  }

  return Array.from({ length: maxVisible }, (_, i) => i + 1);
} 
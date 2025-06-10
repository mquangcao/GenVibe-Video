import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PaginationWrapper = ({ currentPage = 10, totalPage = 10, onPageChange }) => {
  const pageContent = () => {
    const pages = [];

    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPage);
    } else if (currentPage >= totalPage - 2) {
      pages.push(1, '...', totalPage - 2, totalPage - 1, totalPage);
    } else {
      pages.push(1, '...', currentPage, '...', totalPage);
    }

    return pages;
  };

  return (
    <Pagination className={'mx-auto mt-4'}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        {pageContent().map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === 'number' ? (
              <PaginationLink
                href="#"
                className={currentPage === page ? 'bg-blue-500 text-white' : 'cursor-pointer'}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            className={currentPage === totalPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationWrapper;

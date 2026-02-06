'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex w-full justify-center gap-4 mt-6">
      {/* Botón Anterior */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
        </Link>
      ) : (
        <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
        </div>
      )}

      <span className="flex items-center text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>

      {/* Botón Siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Siguiente <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      ) : (
        <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
          Siguiente <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      )}
    </div>
  );
}
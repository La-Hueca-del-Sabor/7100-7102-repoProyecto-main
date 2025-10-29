import React, { useState } from 'react';
import clsx from 'clsx';
import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { Button, Input } from '../index';

/**
 * Componente Table profesional
 * @param {object} props - Propiedades
 * @param {Array} props.columns - Columnas de la tabla: [{ key, label, render }]
 * @param {Array} props.data - Datos a mostrar
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.pagination - Habilitar paginación
 * @param {number} props.itemsPerPage - Items por página
 * @param {boolean} props.searchable - Habilitar búsqueda
 * @param {function} props.onRowClick - Función al hacer clic en una fila
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  pagination = true,
  itemsPerPage = 10,
  searchable = false,
  onRowClick,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos por búsqueda
  const filteredData = searchTerm
    ? data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = pagination
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  // Cambiar de página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Resetear página al cambiar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Búsqueda */}
      {searchable && (
        <div className="flex justify-end">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
            leftIcon={<FaSearch />}
            className="max-w-xs"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Cargando...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={clsx(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-gray-50'
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && !loading && filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(endIndex, filteredData.length)}
            </span>{' '}
            de <span className="font-medium">{filteredData.length}</span> resultados
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              leftIcon={<FaChevronLeft />}
            >
              Anterior
            </Button>

            {/* Números de página */}
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Mostrar solo páginas cercanas
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              rightIcon={<FaChevronRight />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
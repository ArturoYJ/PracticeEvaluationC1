import Search from '@/app/components/Search';
import Pagination from '@/app/components/Pagination';
import { fetchStudentsAtRisk } from '@/app/lib/data';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;

  // Data Fetching: Obtenemos datos y el total de páginas
  const { data: students, totalPages } = await fetchStudentsAtRisk(query, currentPage);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Reporte de Alumnos en Riesgo
        </h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mt-4 mb-6 max-w-md">
        <Search placeholder="Buscar por nombre o email..." />
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo de Riesgo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={`${student.email}-${student.course_name}`} className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {student.course_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${student.final_grade < 6 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {student.final_grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {student.attendance_pct}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {student.risk_reason}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron alumnos en riesgo con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
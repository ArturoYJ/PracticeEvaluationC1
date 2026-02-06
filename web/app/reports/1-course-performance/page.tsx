import { fetchCoursePerformance, fetchTerms } from '@/app/lib/data';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ term?: string }>;
}) {
  // 1. Cargar Periodos disponibles para el dropdown
  const terms = await fetchTerms();
  
  // 2. Await searchParams (Next.js 16+)
  const params = await searchParams;
  const currentTerm = params?.term || terms[0];

  // Si no hay termino en la URL y tenemos datos, redirigimos al más reciente para llenar la tabla
  if (!params?.term && terms.length > 0) {
     redirect(`/reports/1-course-performance?term=${terms[0]}`);
  }

  // 3. Cargar datos del reporte
  const courses = await fetchCoursePerformance(currentTerm);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-500" />
          Rendimiento por Curso
        </h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Filtro de Periodo (Server-Side Link Navigation) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center gap-4 w-fit">
        <Filter className="text-gray-400" size={20} />
        <label className="text-sm font-medium text-gray-700">Filtrar por Periodo:</label>
        <div className="flex gap-2">
          {terms.map((t) => (
            <Link
              key={t}
              href={`/reports/1-course-performance?term=${t}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentTerm === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Inscritos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Promedio</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reprobados</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasa de Falla</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.course_code} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{course.course_name}</div>
                  <div className="text-xs text-gray-500">{course.course_code}</div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{course.total_students}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    course.average_score >= 8 ? 'bg-green-100 text-green-800' : 
                    course.average_score >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.average_score}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{course.failed_count}</td>
                <td className="px-6 py-4 text-center">
                   <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 mt-1">
                      <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${course.failure_rate}%` }}></div>
                   </div>
                   <span className="text-xs text-gray-500 mt-1 block">{course.failure_rate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
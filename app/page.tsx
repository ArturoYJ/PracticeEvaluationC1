import Link from 'next/link';
import { fetchCoursesSummary } from '@/app/lib/data';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  ClipboardCheck, 
  Trophy, 
  ArrowRight 
} from 'lucide-react';

export default async function Page() {
  // 1. Data Fetching (Server Side)
  // Obtenemos el resumen de cursos para mostrar algo de "vida" en el dashboard
  const coursesSummary = await fetchCoursesSummary();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control Académico</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al sistema de gestión de reportes. Selecciona un módulo para consultar.
        </p>
      </div>

      {/* Grid de Tarjetas (Accesos Directos a Reportes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Card 1: Rendimiento */}
        <Link href="/reports/1-course-performance" 
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BarChart3 size={24} />
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Cursos</h3>
          <p className="text-sm text-gray-500 mt-2">
            Análisis de promedios, tasas de reprobación y métricas por periodo.
          </p>
        </Link>

        {/* Card 2: Carga Docente */}
        <Link href="/reports/2-teacher-load" 
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-purple-500 transition-colors" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Carga Docente</h3>
          <p className="text-sm text-gray-500 mt-2">
            Grupos activos y cantidad de alumnos atendidos por profesor.
          </p>
        </Link>

        {/* Card 3: Alumnos en Riesgo */}
        <Link href="/reports/3-students-risk" 
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-red-500 transition-colors" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Alumnos en Riesgo</h3>
          <p className="text-sm text-gray-500 mt-2">
            Detección temprana por bajo promedio o inasistencias críticas.
          </p>
        </Link>

        {/* Card 4: Asistencia */}
        <Link href="/reports/4-attendance" 
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <ClipboardCheck size={24} />
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Asistencia por Grupo</h3>
          <p className="text-sm text-gray-500 mt-2">
            Monitor de asistencia promedio desglosado por grupo y docente.
          </p>
        </Link>

        {/* Card 5: Ranking */}
        <Link href="/reports/5-rank" 
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <Trophy size={24} />
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-yellow-500 transition-colors" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cuadro de Honor</h3>
          <p className="text-sm text-gray-500 mt-2">
            Ranking de mejores promedios segmentado por programa académico.
          </p>
        </Link>
      </div>

      {/* Sección Resumen (Live Data de vw_courses_summary) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Oferta Académica Activa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-900 font-medium">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Materia</th>
                <th className="px-6 py-3 text-center">Créditos</th>
                <th className="px-6 py-3 text-center">Grupos Abiertos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coursesSummary.map((course) => (
                <tr key={course.course_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.code}</td>
                  <td className="px-6 py-4">{course.course_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {course.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 font-semibold">
                    {course.total_groups}
                  </td>
                </tr>
              ))}
              {coursesSummary.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    No hay cursos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
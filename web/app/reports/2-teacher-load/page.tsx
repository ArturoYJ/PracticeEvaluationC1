import { fetchTeacherLoad, fetchTerms } from '@/app/lib/data';
import Link from 'next/link';
import { Users, ArrowLeft, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ term?: string }>;
}) {
  const terms = await fetchTerms();
  const params = await searchParams;
  const currentTerm = params?.term || terms[0];

  // Redirección inteligente si no hay termino seleccionado
  if (!params?.term && terms.length > 0) {
    redirect(`/reports/2-teacher-load?term=${terms[0]}`);
  }

  const teachers = await fetchTeacherLoad(currentTerm);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-purple-500" />
          Carga Docente
        </h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Filtro de Periodo */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center gap-4 w-fit">
        <Filter className="text-gray-400" size={20} />
        <span className="text-sm font-medium text-gray-700">Periodo:</span>
        <div className="flex gap-2">
          {terms.map((t) => (
            <Link
              key={t}
              href={`/reports/2-teacher-load?term=${t}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentTerm === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase">Docente</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-purple-800 uppercase">Grupos Activos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-purple-800 uppercase">Alumnos Atendidos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-purple-800 uppercase">Severidad Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((t) => (
              <tr key={t.email} className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{t.teacher_name}</div>
                  <div className="text-xs text-gray-500">{t.email}</div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">{t.active_groups}</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  {t.total_students_served}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-800">{t.avg_grading_strictness}</span>
                    <span className="text-[10px] text-gray-400">Promedio General</span>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay datos para este periodo.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
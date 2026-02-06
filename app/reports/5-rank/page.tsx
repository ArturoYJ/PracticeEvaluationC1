import { fetchRankedStudents, fetchPrograms } from '@/app/lib/data';
import Link from 'next/link';
import { Trophy, ArrowLeft, GraduationCap } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ program?: string }>;
}) {
  const programs = await fetchPrograms();
  const params = await searchParams;
  // Por defecto mostramos "Todos" o el primero de la lista
  const currentProgram = params?.program || 'Todos';

  const rankings = await fetchRankedStudents(currentProgram);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Cuadro de Honor
        </h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      {/* Filtro por Programa */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="flex items-center gap-2 mr-2 text-gray-600">
          <GraduationCap size={20} />
          <span className="text-sm font-medium">Carrera:</span>
        </div>
        
        <Link
          href="/reports/5-rank?program=Todos"
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            currentProgram === 'Todos'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          Todos
        </Link>

        {programs.map((prog) => (
          <Link
            key={prog}
            href={`/reports/5-rank?program=${encodeURIComponent(prog)}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              currentProgram === prog
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {prog}
          </Link>
        ))}
      </div>

      {/* Tabla de Ranking */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-yellow-50 to-white">
            <tr>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"># Rank</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Programa</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cohorte</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Promedio Global</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rankings.map((student, idx) => (
              <tr key={idx} className={`
                transition-colors hover:bg-yellow-50/30
                ${student.ranking_in_program === 1 ? 'bg-yellow-50/50' : ''}
              `}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {student.ranking_in_program === 1 && <span className="text-2xl">1</span>}
                  {student.ranking_in_program === 2 && <span className="text-2xl">2</span>}
                  {student.ranking_in_program === 3 && <span className="text-2xl">3</span>}
                  {student.ranking_in_program > 3 && (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                      {student.ranking_in_program}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {student.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {student.enrollment_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-block px-3 py-1 text-sm font-bold text-gray-800 bg-gray-100 rounded-lg">
                    {student.global_average}
                  </span>
                </td>
              </tr>
            ))}
            {rankings.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay estudiantes calificados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
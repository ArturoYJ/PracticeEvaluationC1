import { fetchAttendanceByGroup, fetchTerms } from '@/app/lib/data';
import Link from 'next/link';
import { ClipboardCheck, ArrowLeft, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ term?: string }>;
}) {
  const terms = await fetchTerms();
  const params = await searchParams;
  const currentTerm = params?.term || terms[0];

  if (!params?.term && terms.length > 0) {
    redirect(`/reports/4-attendance?term=${terms[0]}`);
  }

  const groups = await fetchAttendanceByGroup(currentTerm);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="text-green-600" />
          Asistencia por Grupo
        </h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center gap-4 w-fit">
        <Filter className="text-gray-400" size={20} />
        <span className="text-sm font-medium text-gray-700">Periodo:</span>
        <div className="flex gap-2">
          {terms.map((t) => (
            <Link
              key={t}
              href={`/reports/4-attendance?term=${t}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentTerm === t
                  ? 'bg-green-600 text-white shadow-sm'
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
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Materia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Docente</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase">Inscritos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-green-800 uppercase">Asistencia Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {groups.map((g, idx) => (
              <tr key={idx} className="hover:bg-green-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{g.course}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{g.teacher}</td>
                <td className="px-6 py-4 text-center text-sm">{g.enrolled_students}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          g.group_attendance_rate < 80 ? 'bg-red-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${g.group_attendance_rate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12">{g.group_attendance_rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
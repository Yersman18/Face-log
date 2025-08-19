"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await authFetch("http://127.0.0.1:8000/api/attendance/courses/");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          console.error("Error cargando cursos", res.status);
        }
      } catch (err) {
        console.error("Error cargando cursos", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Filtrar cursos basado en búsqueda y filtro
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || course.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Función para obtener color del curso (simulado)
  const getCourseColor = (index) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500", 
      "from-purple-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-orange-500 to-amber-500",
      "from-teal-500 to-green-500"
    ];
    return colors[index % colors.length];
  };

  // Función para obtener emoji del curso
  const getCourseIcon = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('matemática') || name.includes('math')) return '🔢';
    if (name.includes('programación') || name.includes('código')) return '💻';
    if (name.includes('inglés') || name.includes('english')) return '🌍';
    if (name.includes('física') || name.includes('physics')) return '⚡';
    if (name.includes('química') || name.includes('chemistry')) return '🧪';
    if (name.includes('historia') || name.includes('history')) return '📚';
    if (name.includes('arte') || name.includes('art')) return '🎨';
    if (name.includes('música') || name.includes('music')) return '🎵';
    return '📖';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">📚</span>
                Mis Cursos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona y accede a todos tus cursos desde aquí
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                <span className="text-indigo-700 font-medium">
                  {courses.length} curso{courses.length !== 1 ? 's' : ''} total{courses.length !== 1 ? 'es' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg transition-all duration-200"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedFilter === "all"
                  ? "bg-indigo-500 text-white shadow-lg"
                  : "bg-white/80 text-gray-600 hover:bg-white/90"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter("active")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedFilter === "active"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-white/80 text-gray-600 hover:bg-white/90"
              }`}
            >
              Activos
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No se encontraron cursos' : 'No tienes cursos disponibles'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Intenta con otro término de búsqueda' 
                : 'Los cursos aparecerán aquí cuando estén disponibles'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {/* Course Header */}
                <div className={`h-32 bg-gradient-to-r ${getCourseColor(index)} relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="text-4xl">
                        {getCourseIcon(course.name)}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {course.name}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>👨‍🏫</span>
                      <span className="text-sm">Profesor asignado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📅</span>
                      <span className="text-sm">Horario: Lun-Vie</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>⏰</span>
                      <span className="text-sm">Duración: Semestre</span>
                    </div>
                  </div>

                  {/* Progress Bar (simulado) */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Progreso</span>
                      <span className="text-xs font-medium text-gray-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getCourseColor(index)} h-2 rounded-full transition-all duration-500`}
                        style={{width: '75%'}}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm">
                      📋 Ver Detalles
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm">
                      ✅
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-semibold text-gray-800">Reportes</h3>
              <p className="text-sm text-gray-600 mt-1">Ver estadísticas</p>
            </button>
            
            <button className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="font-semibold text-gray-800">Horarios</h3>
              <p className="text-sm text-gray-600 mt-1">Ver calendario</p>
            </button>
            
            <button className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
              <h3 className="font-semibold text-gray-800">Asistencia</h3>
              <p className="text-sm text-gray-600 mt-1">Registrar ahora</p>
            </button>
            
            <button className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="font-semibold text-gray-800">Configurar</h3>
              <p className="text-sm text-gray-600 mt-1">Ajustes del curso</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
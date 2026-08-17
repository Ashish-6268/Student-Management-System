import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Plus, 
  List,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getStats, getStudentsByClass, getStudentsByBoard, getRecentStudents } from '../../api/dashboard';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const [stats, setStats] = useState({ total_active: 0, online: 0, offline: 0 });
  const [classData, setClassData] = useState([]);
  const [boardData, setBoardData] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  
  const { data: statsData, isLoading: loadingStats } = useFetch(getStats);
  const { data: classChartData, isLoading: loadingClass } = useFetch(getStudentsByClass);
  const { data: boardChartData, isLoading: loadingBoard } = useFetch(getStudentsByBoard);
  const { data: recentData, isLoading: loadingRecent } = useFetch(getRecentStudents);

  useEffect(() => {
    if (statsData?.data) setStats(statsData.data);
    if (classChartData?.data) setClassData(classChartData.data);
    if (boardChartData?.data) setBoardData(boardChartData.data);
    if (recentData?.data) setRecentStudents(recentData.data);
  }, [statsData, classChartData, boardChartData, recentData]);

  if (loadingStats || loadingClass || loadingBoard || loadingRecent) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of student management statistics</p>
        </div>
        <div className="flex gap-3">
          <Link to="/students">
            <Button variant="secondary" className="flex items-center gap-2">
              <List size={16} /> View All
            </Button>
          </Link>
          <Link to="/students/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={16} /> Add Student
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-6 border-l-4 border-l-blue-500">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_active}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6 border-l-4 border-l-green-500">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Wifi size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Online Mode</p>
            <p className="text-3xl font-bold text-gray-900">{stats.online}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6 border-l-4 border-l-amber-500">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
            <WifiOff size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Offline Mode</p>
            <p className="text-3xl font-bold text-gray-900">{stats.offline}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Class</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="class_name" type="category" width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Board</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={boardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="board_name"
                >
                  {boardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recently Added Students</h3>
          <Link to="/students" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Roll Number</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Added On</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No students added recently</td>
                </tr>
              ) : (
                recentStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.roll_number}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{student.class?.name || 'N/A'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(student.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

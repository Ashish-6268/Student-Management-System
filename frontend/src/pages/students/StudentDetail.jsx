import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudent, archiveStudent, restoreStudent } from '../../api/students';
import { useToast } from '../../context/ToastContext';
import { Pencil, Archive, ArchiveRestore, ArrowLeft, Clock, User, Phone, Mail, BookOpen } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await getStudent(id);
      if (res.success) {
        setStudent(res.data);
      } else {
        showToast('Student not found', 'error');
        navigate('/students');
      }
    } catch (error) {
      showToast('Error fetching student details', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleArchiveRestore = async () => {
    setConfirmDialog(false);
    try {
      const actionFn = student.is_archived ? restoreStudent : archiveStudent;
      const res = await actionFn(id);
      
      if (res.success) {
        showToast(`Student ${student.is_archived ? 'restored' : 'archived'} successfully`, 'success');
        fetchStudent();
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  if (!student) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {student.is_archived && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-start">
          <Archive className="text-amber-500 mr-3 shrink-0" size={24} />
          <div>
            <h3 className="text-amber-800 font-medium">This student is archived</h3>
            <p className="text-amber-700 text-sm mt-1">Archived students cannot be edited. Restore the student to make changes.</p>
          </div>
        </div>
      )}

      <PageHeader 
        title={student.name}
        subtitle={
          <Link to="/students" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm">
            <ArrowLeft size={16} className="mr-1" /> Back to Students
          </Link>
        }
        action={
          <div className="flex gap-3">
            {!student.is_archived && (
              <Link to={`/students/${id}/edit`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Pencil size={16} /> Edit
                </Button>
              </Link>
            )}
            <Button 
              variant={student.is_archived ? 'primary' : 'danger'} 
              className="flex items-center gap-2"
              onClick={() => setConfirmDialog(true)}
            >
              {student.is_archived ? (
                <><ArchiveRestore size={16} /> Restore</>
              ) : (
                <><Archive size={16} /> Archive</>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Card */}
        <Card className="lg:col-span-2 p-6 shadow-sm border-t-4 border-t-indigo-500">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{student.roll_number}</span>
                  <span>•</span>
                  <Badge variant={student.is_archived ? 'secondary' : 'success'}>
                    {student.is_archived ? 'Archived' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mt-8 border-t pt-6">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Mail size={16} /> Email Address</p>
              <p className="font-medium text-gray-900">{student.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Phone size={16} /> Primary Contact</p>
              <p className="font-medium text-gray-900">{student.contact_number_1}</p>
            </div>

            {(student.contact_number_2 || student.contact_number_3) && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {student.contact_number_2 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Phone size={16} /> Secondary Contact</p>
                    <p className="font-medium text-gray-900">{student.contact_number_2}</p>
                  </div>
                )}
                {student.contact_number_3 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Phone size={16} /> Emergency Contact</p>
                    <p className="font-medium text-gray-900">{student.contact_number_3}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {student.remarks && (
            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-gray-500 mb-2">Remarks / Notes</p>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                {student.remarks}
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-500" /> Academic Profile
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Class</span>
                <span className="font-medium text-gray-900 bg-indigo-50 px-2 py-1 rounded">{student.class_name || student.class?.name || 'N/A'}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Board</span>
                <span className="font-medium text-gray-900">{student.board_name || student.board?.name || 'N/A'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Mode</span>
                <span className="font-medium text-gray-900">{student.mode_name || student.mode?.name || 'N/A'}</span>
              </li>
            </ul>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Enrolled Subjects</h4>
              {student.subjects && student.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.subjects.map(sub => (
                    <span key={sub.id} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-200">
                      {sub.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No subjects assigned.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" /> System Info
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex flex-col">
                <span className="text-gray-500">Created At</span>
                <span className="font-medium text-gray-900">{formatDateTime(student.created_at)}</span>
              </li>
              <li className="flex flex-col mt-2">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium text-gray-900">{formatDateTime(student.updated_at)}</span>
              </li>
            </ul>
          </Card>
        </div>

      </div>

      <ConfirmDialog
        isOpen={confirmDialog}
        title={student.is_archived ? "Restore Student" : "Archive Student"}
        message={`Are you sure you want to ${student.is_archived ? 'restore' : 'archive'} ${student.name}?`}
        confirmLabel={student.is_archived ? "Restore" : "Archive"}
        confirmVariant={student.is_archived ? "primary" : "danger"}
        onConfirm={handleArchiveRestore}
        onCancel={() => setConfirmDialog(false)}
      />
    </div>
  );
}

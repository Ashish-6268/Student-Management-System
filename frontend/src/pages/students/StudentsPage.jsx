import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Pencil, Archive, ArchiveRestore, Search, ArrowUpDown } from 'lucide-react';
import { getStudents, archiveStudent, restoreStudent } from '../../api/students';
import { getClasses, getBoards, getModes, getSubjects } from '../../api/settings';
import useDebounce from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // URL State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const classId = searchParams.get('class_id') || '';
  const boardId = searchParams.get('board_id') || '';
  const modeId = searchParams.get('mode_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const isArchived = searchParams.get('is_archived') || 'false';
  const sortBy = searchParams.get('sort_by') || 'name';
  const sortOrder = searchParams.get('sort_order') || 'asc';

  // Local State
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filter Options State
  const [classes, setClasses] = useState([]);
  const [boards, setBoards] = useState([]);
  const [modes, setModes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, studentId: null, action: null });

  // Fetch filter options
  useEffect(() => {
    Promise.all([
      getClasses(), getBoards(), getModes(), getSubjects()
    ]).then(([resClasses, resBoards, resModes, resSubjects]) => {
      if (resClasses.success) setClasses(resClasses.data);
      if (resBoards.success) setBoards(resBoards.data);
      if (resModes.success) setModes(resModes.data);
      if (resSubjects.success) setSubjects(resSubjects.data);
    }).catch(err => console.error(err));
  }, []);

  // Update search param when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      updateParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * 10;
      const params = {
        offset,
        limit: 10,
        search: searchParam,
        class_id: classId,
        board_id: boardId,
        mode_id: modeId,
        subject_id: subjectId,
        is_archived: isArchived === 'true',
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      const res = await getStudents(params);
      if (res.success) {
        setStudents(res.data);
        if (res.meta) setMeta(res.meta);
      }
    } catch (error) {
      showToast('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, searchParam, classId, boardId, modeId, subjectId, isArchived, sortBy, sortOrder]);

  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handleArchiveRestore = async () => {
    const { studentId, action } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    
    try {
      let res;
      if (action === 'archive') {
        res = await archiveStudent(studentId);
      } else {
        res = await restoreStudent(studentId);
      }
      
      if (res.success) {
        showToast(`Student ${action}d successfully`, 'success');
        fetchStudents();
      } else {
        showToast(res.message || `Failed to ${action} student`, 'error');
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const columns = [
    { key: 'roll_number', title: 'Roll No', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { 
      key: 'class', 
      title: 'Class',
      render: (item) => item.class?.name || 'N/A'
    },
    { 
      key: 'board', 
      title: 'Board',
      render: (item) => item.board?.name || 'N/A'
    },
    { 
      key: 'mode', 
      title: 'Mode',
      render: (item) => item.mode?.name || 'N/A'
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (item) => (
        <Badge variant={item.is_archived ? 'secondary' : 'success'}>
          {item.is_archived ? 'Archived' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            title="View Details"
            onClick={() => navigate(`/students/${item.id}`)}
          >
            <Eye size={18} />
          </button>
          
          {!item.is_archived && (
            <button 
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Student"
              onClick={() => navigate(`/students/${item.id}/edit`)}
            >
              <Pencil size={18} />
            </button>
          )}
          
          {item.is_archived ? (
            <button 
              className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors"
              title="Restore Student"
              onClick={() => setConfirmDialog({ isOpen: true, studentId: item.id, action: 'restore' })}
            >
              <ArchiveRestore size={18} />
            </button>
          ) : (
            <button 
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Archive Student"
              onClick={() => setConfirmDialog({ isOpen: true, studentId: item.id, action: 'archive' })}
            >
              <Archive size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Students" 
        action={
          <Link to="/students/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={18} /> Add Student
            </Button>
          </Link>
        }
      />
      
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={sortBy} 
                onChange={(e) => updateParams({ sort_by: e.target.value, page: 1 })}
                options={[
                  { value: 'name', label: 'Sort by Name' },
                  { value: 'roll_number', label: 'Sort by Roll No' },
                  { value: 'created_at', label: 'Sort by Date Added' }
                ]}
                className="min-w-[150px]"
              />
              <button
                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center"
                onClick={() => updateParams({ sort_order: sortOrder === 'asc' ? 'desc' : 'asc' })}
                title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                <ArrowUpDown size={20} className={sortOrder === 'asc' ? 'text-gray-500' : 'text-indigo-500'} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
            <Select
              value={classId}
              onChange={(e) => updateParams({ class_id: e.target.value, page: 1 })}
              options={[{ value: '', label: 'All Classes' }, ...classes.map(c => ({ value: c.id.toString(), label: c.name }))]}
            />
            <Select
              value={boardId}
              onChange={(e) => updateParams({ board_id: e.target.value, page: 1 })}
              options={[{ value: '', label: 'All Boards' }, ...boards.map(b => ({ value: b.id.toString(), label: b.name }))]}
            />
            <Select
              value={modeId}
              onChange={(e) => updateParams({ mode_id: e.target.value, page: 1 })}
              options={[{ value: '', label: 'All Modes' }, ...modes.map(m => ({ value: m.id.toString(), label: m.name }))]}
            />
            <Select
              value={subjectId}
              onChange={(e) => updateParams({ subject_id: e.target.value, page: 1 })}
              options={[{ value: '', label: 'All Subjects' }, ...subjects.map(s => ({ value: s.id.toString(), label: s.name }))]}
            />
            <Select
              value={isArchived}
              onChange={(e) => updateParams({ is_archived: e.target.value, page: 1 })}
              options={[
                { value: 'false', label: 'Active Students' },
                { value: 'true', label: 'Archived Students' }
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                data={students}
                onRowClick={(item) => navigate(`/students/${item.id}`)}
              />
            </div>
            {meta.pages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination 
                  currentPage={page}
                  totalPages={meta.pages}
                  onPageChange={(p) => updateParams({ page: p })}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            title="No students found"
            description="Try adjusting your search or filters."
            icon={<Search className="w-12 h-12 text-gray-300" />}
          />
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'archive' ? 'Archive Student' : 'Restore Student'}
        message={`Are you sure you want to ${confirmDialog.action} this student?`}
        confirmLabel={confirmDialog.action === 'archive' ? 'Archive' : 'Restore'}
        confirmVariant={confirmDialog.action === 'archive' ? 'danger' : 'primary'}
        onConfirm={handleArchiveRestore}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}

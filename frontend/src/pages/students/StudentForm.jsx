import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-form'; // Note: Will use react-hook-form properly
import { useForm as useHookForm } from 'react-hook-form';
import { getStudent, createStudent, updateStudent } from '../../api/students';
import { getClasses, getBoards, getModes, getClassSubjects } from '../../api/settings';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Spinner from '../../components/ui/Spinner';

export default function StudentForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  
  // Options state
  const [classes, setClasses] = useState([]);
  const [boards, setBoards] = useState([]);
  const [modes, setModes] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useHookForm({
    defaultValues: {
      roll_number: '',
      name: '',
      email: '',
      class_id: '',
      board_id: '',
      mode_id: '',
      contact_number_1: '',
      contact_number_2: '',
      contact_number_3: '',
      remarks: '',
      subject_ids: []
    }
  });

  const watchClassId = watch('class_id');
  const watchSubjectIds = watch('subject_ids');

  // Fetch initial data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [resClasses, resBoards, resModes] = await Promise.all([
          getClasses(), getBoards(), getModes()
        ]);
        
        if (resClasses.success) setClasses(resClasses.data);
        if (resBoards.success) setBoards(resBoards.data);
        if (resModes.success) setModes(resModes.data);

        if (isEditMode) {
          const resStudent = await getStudent(id);
          if (resStudent.success) {
            const student = resStudent.data;
            if (student.is_archived) {
              showToast('Cannot edit an archived student', 'warning');
              navigate(`/students/${id}`);
              return;
            }
            
            // Pre-fill form
            setValue('roll_number', student.roll_number);
            setValue('name', student.name);
            setValue('email', student.email);
            setValue('class_id', student.class_id?.toString() || '');
            setValue('board_id', student.board_id?.toString() || '');
            setValue('mode_id', student.mode_id?.toString() || '');
            setValue('contact_number_1', student.contact_number_1 || '');
            setValue('contact_number_2', student.contact_number_2 || '');
            setValue('contact_number_3', student.contact_number_3 || '');
            setValue('remarks', student.remarks || '');
            
            if (student.subjects) {
              setValue('subject_ids', student.subjects.map(s => s.id));
            }
          }
        }
      } catch (error) {
        showToast('Error loading form data', 'error');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchFormData();
  }, [id, isEditMode, navigate, setValue, showToast]);

  // Fetch subjects when class changes
  useEffect(() => {
    if (watchClassId) {
      setLoadingSubjects(true);
      getClassSubjects(watchClassId)
        .then(res => {
          if (res.success) {
            setAvailableSubjects(res.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingSubjects(false));
    } else {
      setAvailableSubjects([]);
    }
  }, [watchClassId]);

  const onSubmit = async (data) => {
    if (data.subject_ids.length === 0) {
      showToast('Please select at least one subject', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        class_id: parseInt(data.class_id),
        board_id: parseInt(data.board_id),
        mode_id: parseInt(data.mode_id),
        subject_ids: data.subject_ids.map(id => parseInt(id))
      };

      const res = isEditMode 
        ? await updateStudent(id, payload)
        : await createStudent(payload);

      if (res.success) {
        showToast(`Student ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
        navigate(isEditMode ? `/students/${id}` : '/students');
      } else {
        showToast(res.message || 'Error saving student', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId) => {
    const current = watchSubjectIds || [];
    if (current.includes(subjectId)) {
      setValue('subject_ids', current.filter(id => id !== subjectId));
    } else {
      setValue('subject_ids', [...current, subjectId]);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title={isEditMode ? 'Edit Student' : 'Add New Student'} 
        subtitle={isEditMode ? 'Update student information' : 'Register a new student'}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Roll Number"
                {...register('roll_number', { required: 'Roll Number is required' })}
                error={errors.roll_number?.message}
                disabled={isEditMode}
                placeholder="e.g. STU001"
              />
              <Input
                label="Full Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                placeholder="John Doe"
              />
              <Input
                label="Email Address"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                error={errors.email?.message}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Class"
                {...register('class_id', { required: 'Class is required' })}
                error={errors.class_id?.message}
                options={[{ value: '', label: 'Select Class' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
              />
              <Select
                label="Board"
                {...register('board_id', { required: 'Board is required' })}
                error={errors.board_id?.message}
                options={[{ value: '', label: 'Select Board' }, ...boards.map(b => ({ value: b.id, label: b.name }))]}
              />
              <Select
                label="Mode"
                {...register('mode_id', { required: 'Mode is required' })}
                error={errors.mode_id?.message}
                options={[{ value: '', label: 'Select Mode' }, ...modes.map(m => ({ value: m.id, label: m.name }))]}
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects *</label>
              {!watchClassId ? (
                <p className="text-sm text-gray-500 italic">Please select a class first to view available subjects.</p>
              ) : loadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner size="sm" /> Loading subjects...</div>
              ) : availableSubjects.length === 0 ? (
                <p className="text-sm text-red-500">No subjects available for this class.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {availableSubjects.map(subject => (
                    <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={(watchSubjectIds || []).includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                      />
                      <span className="text-sm text-gray-700">{subject.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Primary Contact (10 digits)"
                {...register('contact_number_1', { 
                  required: 'Primary contact is required',
                  pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' }
                })}
                error={errors.contact_number_1?.message}
                placeholder="9876543210"
              />
              <Input
                label="Secondary Contact"
                {...register('contact_number_2', {
                  pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits if provided' }
                })}
                error={errors.contact_number_2?.message}
                placeholder="Optional"
              />
              <Input
                label="Emergency Contact"
                {...register('contact_number_3', {
                  pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits if provided' }
                })}
                error={errors.contact_number_3?.message}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                {...register('remarks')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Any special notes or remarks..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {isEditMode ? 'Update Student' : 'Save Student'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}

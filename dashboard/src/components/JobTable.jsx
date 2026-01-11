import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Inbox,
    MapPin,
    Building2,
    ExternalLink,
    Trash2,
    Edit3,
    Check,
    X,
    MessageSquare,
    Link2,
    Briefcase
} from 'lucide-react';
import { useUpdateJob, useDeleteJob } from '../hooks/useJobs';
import { formatDate } from '../utils/formatters';
import StatusSwitcher from './StatusSwitcher';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

function JobTable({ jobs }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const updateMutation = useUpdateJob();
    const deleteMutation = useDeleteJob();

    const handleEdit = (job) => {
        setEditingId(job.id);
        setEditData({
            status: job.status,
            notes: job.notes,
            follow_up_date: job.follow_up_date
        });
    };

    const handleSave = async (id) => {
        try {
            await toast.promise(
                updateMutation.mutateAsync({ id, data: editData }),
                {
                    loading: 'Updating...',
                    success: 'Job updated successfully!',
                    error: 'Failed to update job'
                }
            );
            setEditingId(null);
        } catch (error) {
            // Error handled by toast
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await toast.promise(
                updateMutation.mutateAsync({ id, data: { status: newStatus } }),
                {
                    loading: `Moving to ${newStatus}...`,
                    success: `Moved to ${newStatus}`,
                    error: 'Update failed'
                }
            );
        } catch (error) {
            // Error handled by toast
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDelete = async (id, company, title) => {
        try {
            await toast.promise(
                deleteMutation.mutateAsync(id),
                {
                    loading: 'Deleting...',
                    success: 'Application removed',
                    error: 'Failed to delete'
                }
            );
        } catch (error) {
            // Error handled by toast
        }
    };

    if (jobs.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card glass"
                style={{ textAlign: 'center', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
            >
                <div style={{
                    background: 'var(--surface-bg-alt)',
                    padding: '24px',
                    borderRadius: '50%',
                    color: 'var(--text-muted)'
                }}>
                    <Inbox size={48} strokeWidth={1} />
                </div>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                        No applications yet
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Install the browser extension and start saving jobs from LinkedIn, Indeed, and more!
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-bg-alt)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Company & Title
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Status / Stage
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Notes
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {jobs.map((job) => (
                                <motion.tr
                                    layout
                                    key={job.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-bg-alt)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>
                                                {job.company}
                                            </div>
                                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                <Briefcase size={14} />
                                                <a
                                                    href={job.job_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                                >
                                                    {job.job_title}
                                                </a>
                                            </div>
                                            {job.location && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                    <MapPin size={12} />
                                                    {job.location}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        {editingId === job.id ? (
                                            <div className="select-wrapper" style={{ position: 'relative' }}>
                                                <select
                                                    value={editData.status}
                                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                    className="select"
                                                    style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '10px' }}
                                                >
                                                    <option value="Saved">Saved</option>
                                                    {STATUSES.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <StatusSwitcher
                                                currentStatus={job.status}
                                                onStatusChange={(newStatus) => handleStatusUpdate(job.id, newStatus)}
                                                isUpdating={updateMutation.isPending}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '20px 24px', maxWidth: '300px' }}>
                                        {editingId === job.id ? (
                                            <div style={{ position: 'relative' }}>
                                                <MessageSquare size={14} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-muted)' }} />
                                                <textarea
                                                    value={editData.notes}
                                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                    className="textarea"
                                                    style={{ fontSize: '13px', padding: '8px 10px 8px 32px', minHeight: '60px', borderRadius: '10px' }}
                                                    placeholder="Add notes..."
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: '500' }}>
                                                {job.notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>No notes yet</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {editingId === job.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSave(job.id)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        <Check size={16} />
                                                        <span>Save</span>
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}
                                                    >
                                                        <X size={16} />
                                                        <span>Cancel</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(job)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px', borderRadius: '10px' }}
                                                        title="Edit Application"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <a
                                                        href={job.job_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary"
                                                        style={{ padding: '8px', borderRadius: '10px' }}
                                                        title="Open URL"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(job.id, job.company, job.job_title)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                        disabled={deleteMutation.isPending}
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default JobTable;

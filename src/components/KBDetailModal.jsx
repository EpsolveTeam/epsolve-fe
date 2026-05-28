import { useState, useEffect, useMemo } from 'react'
import { X, Loader2 } from 'lucide-react'
import { getKnowledgeBaseDetail, updateKnowledgeBase, deleteKnowledgeBase } from '../api'
import './KBDetailModal.css'

export default function KBDetailModal({ item, onClose, onUpdate, onDelete }) {
  const [fullItem, setFullItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      try {
        const detail = await getKnowledgeBaseDetail(item.id)
        setFullItem(detail)
        setEditContent(detail.content)
      } catch (error) {
        console.error('Failed to fetch detail:', error)
      } finally {
        setLoading(false)
      }
    }
    if (item) fetchDetail()
  }, [item])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateKnowledgeBase(item.id, { content: editContent })
      setFullItem(updated)
      setEditing(false)
      onUpdate && onUpdate(updated)
    } catch (error) {
      console.error('Failed to update:', error)
      alert('Gagal memperbarui knowledge base')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin menghapus knowledge base ini?')) return
    try {
      await deleteKnowledgeBase(item.id)
      onDelete && onDelete(item.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Gagal menghapus knowledge base')
    }
  }

  if (!item || loading) {
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal kb-modal">
          <div className="loading-state">
            <Loader2 className="spin" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  function extractAnswer(text) {
    const match = text.match(/\*\*Solusi Helpdesk:\*\*\s*\n(.+)/s)
    return match ? match[1].trim() : text
  }

  function extractQuestion(text) {
    const match = text.match(/\*\*Keluhan Pelanggan:\*\*\s*\n(.+?)(?:\n|$)/)
    return match ? match[1].trim() : text
  }

  if (!fullItem) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal kb-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <div className="kb-modal-header">
          <div>
            <h2>{extractQuestion(fullItem.content)}</h2>
            <p className="kb-modal-q">{fullItem.category}</p>
          </div>
          <span className="ticket-tag">{fullItem.division}</span>
        </div>

        <div className="ticket-modal-divider" />

        <div className="field-label">Terakhir diperbarui: {new Date(fullItem.updated_at).toLocaleDateString('id-ID')}</div>
        {editing ? (
          <textarea
            className="answer-edit"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={10}
          />
        ) : (
          <div className="answer-box">{extractAnswer(fullItem.content)}</div>
        )}

        <div className="modal-actions" style={{marginTop:16}}>
          {editing ? (
            <>
              <button className="btn-cancel" onClick={() => { setEditing(false); setEditContent(fullItem.content) }}><span style={{color: 'white'}}>Batal</span></button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="spin" size={14} /> : <span style={{color: 'white'}}>Simpan</span>}
              </button>
            </>
          ) : (
            <>
              <button className="btn-danger" onClick={handleDelete}>
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 3.16667H12.5M11.1667 3.16667V12.5C11.1667 13.1667 10.5 13.8333 9.83333 13.8333H3.16667C2.5 13.8333 1.83333 13.1667 1.83333 12.5V3.16667M3.83333 3.16667V1.83333C3.83333 1.16667 4.5 0.5 5.16667 0.5H7.83333C8.5 0.5 9.16667 1.16667 9.16667 1.83333V3.16667" stroke="#FAFAFA" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{color: 'white'}}>Hapus</span>
              </button>
              <button className="btn-edit" onClick={() => setEditing(true)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.49935 11.8332H12.4993M8.49935 1.83317L10.4993 3.83317M9.41667 0.91449C9.68206 0.649096 10.042 0.5 10.4173 0.5C10.7927 0.5 11.1526 0.649096 11.418 0.91449C11.6834 1.17988 11.8325 1.53983 11.8325 1.91516C11.8325 2.29048 11.6834 2.65043 11.418 2.91582L3.41133 10.9232C3.25273 11.0818 3.05668 11.1978 2.84133 11.2605L0.926667 11.8192C0.869301 11.8359 0.808493 11.8369 0.750606 11.8221C0.69272 11.8072 0.639885 11.7771 0.597631 11.7349C0.555377 11.6926 0.525259 11.6398 0.510429 11.5819C0.495599 11.524 0.496602 11.4632 0.513333 11.4058L1.072 9.49116C1.13481 9.27605 1.25083 9.08024 1.40933 8.92182L9.41667 0.91449Z" stroke="#FAFAFA" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{color: 'white'}}>Edit</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

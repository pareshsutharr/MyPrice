import { useState, useCallback } from 'react'
import { UploadCloud, ShieldCheck, Layers3 } from 'lucide-react'
import './ImportData.css'

const ImportData = () => {
  const [files, setFiles] = useState([])
  const [statusMessage, setStatusMessage] = useState('')

  const handleFilesChange = useCallback((event) => {
    const nextFiles = Array.from(event.target.files ?? [])
    if (!nextFiles.length) return
    setFiles((prev) => [...prev, ...nextFiles])
    setStatusMessage(
      `Queued ${nextFiles.length} statement${nextFiles.length === 1 ? '' : 's'} for processing. You can keep adding more.`,
    )
    event.target.value = ''
  }, [])

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index))
    setStatusMessage('Removed the selected file.')
  }, [])

  const handleClear = useCallback(() => {
    setFiles([])
    setStatusMessage('Cleared the upload queue.')
  }, [])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      if (files.length === 0) {
        setStatusMessage('Attach at least one statement to begin import.')
        return
      }
      setStatusMessage(
        `Ready to ingest ${files.length} file${files.length === 1 ? '' : 's'}. Review mapping and confirm to post bulk entries.`,
      )
    },
    [files.length],
  )

  return (
    <div className="space-y-6 pb-16">
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-3">
          <UploadCloud className="h-6 w-6 text-slate-900 dark:text-white" />
          <div>
            <p className="text-sm text-slate-500">Import center</p>
            <h1 className="text-2xl font-display text-slate-900">Upload statements</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Bring in PDF, CSV, XML, XLSX, or even receipt photos for OCR. We will scan the files, match them
          to your categories, and build multiple entries in one batch.
        </p>
        <div className="import-guidelines">
          <div>
            <ShieldCheck className="h-5 w-5" />
            <p>Data stays on-device until you confirm the import.</p>
          </div>
          <div>
            <Layers3 className="h-5 w-5" />
            <p>Mix formats per upload — we normalize them for you.</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Bulk upload</p>
            <h2 className="text-xl font-display text-slate-900">Queue your files</h2>
          </div>
          <div className="text-xs text-slate-500 text-right">
            <p>Accepted: .pdf · .csv · .xml · .xlsx · images</p>
            <p>Tip: group files by month for best matching.</p>
          </div>
        </div>
        <form className="import-upload" onSubmit={handleSubmit}>
          <label className="import-upload__dropzone">
            <input
              type="file"
              accept=".pdf,.csv,.xml,.xlsx,image/*"
              multiple
              onChange={handleFilesChange}
            />
            <span className="import-upload__title">Drop files here or browse</span>
            <span className="import-upload__subtitle">
              Auto-detects dates, merchants, and categories for bulk entry.
            </span>
          </label>
          {files.length > 0 ? (
            <ul className="import-upload__files">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · {file.type || 'Unspecified type'}
                    </p>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No files attached yet.</p>
          )}
          <div className="import-upload__actions">
            <button type="button" className="btn-secondary" onClick={handleClear} disabled={files.length === 0}>
              Clear queue
            </button>
            <button type="submit" className="btn-primary" disabled={files.length === 0}>
              Prepare import
            </button>
          </div>
        </form>
        {statusMessage && (
          <p className="import-upload__status" aria-live="polite">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  )
}

export default ImportData

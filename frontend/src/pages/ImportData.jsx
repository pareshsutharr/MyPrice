import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Layers3, ShieldCheck, UploadCloud } from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import { api } from '@services/api.js'
import './ImportData.css'

const createQueueItem = (file) => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
  file,
  status: 'idle',
  progress: 0,
  imported: 0,
  skipped: 0,
  error: '',
  details: '',
})

const ImportData = () => {
  const navigate = useNavigate()
  const { refreshInvestments } = useFinance()
  const [queue, setQueue] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [redirectPending, setRedirectPending] = useState(false)

  const updateQueueItem = useCallback((id, patch) => {
    setQueue((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }, [])

  const handleFilesChange = useCallback((event) => {
    const nextFiles = Array.from(event.target.files ?? [])
    if (!nextFiles.length) return
    setQueue((previous) => [...previous, ...nextFiles.map(createQueueItem)])
    setStatusMessage(
      `Queued ${nextFiles.length} file${nextFiles.length === 1 ? '' : 's'} for import.`,
    )
    event.target.value = ''
  }, [])

  const handleRemoveFile = useCallback((id) => {
    setQueue((previous) => previous.filter((item) => item.id !== id))
  }, [])

  const handleClear = useCallback(() => {
    setQueue([])
    setStatusMessage('Cleared the import queue.')
  }, [])

  const runImport = useCallback(
    async (queueItem) => {
      updateQueueItem(queueItem.id, { status: 'uploading', progress: 0, error: '', details: '' })

      try {
        const response = await api.importInvestments({
          broker: 'Manual',
          statementDate: new Date().toISOString().split('T')[0],
          file: queueItem.file,
          onUploadProgress: (event) => {
            const percent = event.total
              ? Math.min(95, Math.round((event.loaded / event.total) * 100))
              : 0
            updateQueueItem(queueItem.id, {
              status: 'uploading',
              progress: percent,
            })
          },
        })

        updateQueueItem(queueItem.id, { status: 'processing', progress: 98 })

        const imported = response?.data?.imported ?? 0
        const skipped = response?.data?.skipped ?? 0
        const errors = response?.data?.errors ?? []

        updateQueueItem(queueItem.id, {
          status: 'done',
          progress: 100,
          imported,
          skipped,
          error: '',
          details: errors.length ? errors.map((entry) => `Row ${entry.row}: ${entry.reason}`).join(' ') : '',
        })

        await refreshInvestments()
        toast.success(`${imported} holdings imported successfully.`)
        setStatusMessage(`Imported ${imported} holdings from ${queueItem.file.name}.`)
        setRedirectPending(true)
        window.setTimeout(() => navigate('/investments'), 1500)
      } catch (error) {
        const apiReason =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Unknown import error'
        const rejectedRows = error?.response?.data?.data?.skipped ?? 0
        const details = error?.response?.data?.details || ''

        updateQueueItem(queueItem.id, {
          status: 'error',
          progress: 0,
          error: `Import failed: ${apiReason}`,
          details,
          skipped: rejectedRows,
        })
      }
    },
    [navigate, refreshInvestments, updateQueueItem],
  )

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (queue.length === 0) {
        setStatusMessage('Attach at least one statement to begin import.')
        return
      }

      for (const item of queue) {
        if (item.status === 'uploading' || item.status === 'processing' || item.status === 'done') {
          continue
        }
        // eslint-disable-next-line no-await-in-loop
        await runImport(item)
      }
    },
    [queue, runImport],
  )

  const activeCount = useMemo(
    () => queue.filter((item) => item.status === 'uploading' || item.status === 'processing').length,
    [queue],
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
          Import your investment holdings from broker-exported spreadsheets and merge them into the live portfolio.
        </p>
        <div className="import-guidelines">
          <div>
            <ShieldCheck className="h-5 w-5" />
            <p>Each file is imported into your authenticated account only.</p>
          </div>
          <div>
            <Layers3 className="h-5 w-5" />
            <p>Rows are upserted using scheme name + ISIN to avoid duplicate holdings.</p>
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
            <p>Accepted: .csv · .xlsx · .xls</p>
            <p>{activeCount > 0 ? `${activeCount} import${activeCount === 1 ? '' : 's'} in progress` : 'Ready to import'}</p>
          </div>
        </div>

        <form className="import-upload" onSubmit={handleSubmit}>
          <label className="import-upload__dropzone">
            <input type="file" accept=".csv,.xlsx,.xls" multiple onChange={handleFilesChange} />
            <span className="import-upload__title">Drop files here or browse</span>
            <span className="import-upload__subtitle">
              Supported formats: CSV, XLSX. Download sample template{' '}
              <a
                href="/sample-import-template.xlsx"
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer"
              >
                →
              </a>
            </span>
          </label>

          {queue.length > 0 ? (
            <ul className="import-upload__files">
              {queue.map((item) => (
                <li key={item.id} className="import-upload__file-row">
                  <div className="import-upload__file-main">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{item.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(item.file.size / 1024).toFixed(1)} KB · {item.file.type || 'Spreadsheet'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: {item.status}
                        {item.imported > 0 ? ` · ${item.imported} imported` : ''}
                        {item.skipped > 0 ? ` · ${item.skipped} rejected` : ''}
                      </p>
                    </div>
                    <div className="import-upload__file-actions">
                      {item.status === 'error' ? (
                        <button type="button" onClick={() => runImport(item)}>Retry</button>
                      ) : null}
                      {item.status !== 'uploading' && item.status !== 'processing' ? (
                        <button type="button" onClick={() => handleRemoveFile(item.id)}>Remove</button>
                      ) : null}
                    </div>
                  </div>

                  {(item.status === 'uploading' || item.status === 'processing' || item.status === 'done') && (
                    <div className="import-upload__progress">
                      <div style={{ width: `${item.progress}%` }} />
                    </div>
                  )}

                  {item.error ? <p className="import-upload__error">{item.error}</p> : null}
                  {item.details ? <p className="import-upload__details">{item.details}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No files attached yet.</p>
          )}

          <div className="import-upload__actions">
            <button type="button" className="btn-secondary" onClick={handleClear} disabled={queue.length === 0}>
              Clear queue
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={queue.length === 0 || activeCount > 0 || redirectPending}
            >
              {redirectPending ? 'Redirecting...' : activeCount > 0 ? 'Importing...' : 'Import holdings'}
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

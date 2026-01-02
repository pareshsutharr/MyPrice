import { useState } from 'react'

const StatementUploader = ({ onImport }) => {
  const [broker, setBroker] = useState('Angel One')
  const [statementDate, setStatementDate] = useState(() => new Date().toISOString().split('T')[0])
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [skipped, setSkipped] = useState([])

  const reset = () => {
    setFile(null)
    setError('')
    setStatus('')
    setProgress(0)
    setSkipped([])
  }

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setError('')
    setStatus(`${selected.name} ready to upload`)
    setProgress(0)
  }

  const handleImport = async () => {
    if (!file) {
      setError('Select a CSV/XLSX statement first')
      return
    }
    setLoading(true)
    setStatus('Uploading...')
    setProgress(10)
    try {
      const response = await onImport({
        broker,
        statementDate,
        file,
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 100))
            setProgress(percent)
          }
        },
      })
      setProgress(100)
      const skippedRows = response?.errors ?? []
      setSkipped(skippedRows)
      setError(skippedRows.length ? `Imported with ${skippedRows.length} skipped rows.` : '')
      setStatus(
        response?.holdings
          ? `Imported ${response.holdings.length} holdings from ${broker}`
          : 'Import complete',
      )
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Upload failed. Please try again.')
      setStatus('')
      setSkipped([])
    } finally {
      setLoading(false)
      setFile(null)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div className="glass-card p-4 space-y-4">
      <div>
        <h3 className="text-xl font-display">Upload statement</h3>
        <p className="text-sm text-slate-500">
          Drop your Angel One / Groww holdings XLSX/CSV, we’ll auto-merge schemes without
          duplicates.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Broker</label>
          <select
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            value={broker}
            onChange={(event) => setBroker(event.target.value)}
          >
            <option value="Angel One">Angel One</option>
            <option value="Groww">Groww</option>
            <option value="External">External</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-500">Statement date</label>
          <input
            type="date"
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            value={statementDate}
            onChange={(event) => setStatementDate(event.target.value)}
          />
        </div>
      </div>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-borderLight rounded-xl p-6 text-sm text-slate-500 cursor-pointer">
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
        {file ? (
          <span className="text-slate-900">{file.name}</span>
        ) : (
          <span>Drop CSV/XLSX or click to browse</span>
        )}
      </label>
      {loading && (
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-accentBlue to-accentPurple transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {skipped.length > 0 && (
        <div className="bg-rose-50 text-rose-600 text-left text-sm p-3 rounded-xl space-y-1 max-h-40 overflow-auto">
          {skipped.map((row) => (
            <p key={`${row.schemeName}-${row.message}`}>
              {row.schemeName}: {row.message}
            </p>
          ))}
        </div>
      )}
      {status && !error && <p className="text-sm text-emerald-600">{status}</p>}
      <button
        type="button"
        className="btn-primary w-full"
        onClick={handleImport}
        disabled={!file || loading}
      >
        {loading ? 'Importing...' : 'Import holdings'}
      </button>
    </div>
  )
}

export default StatementUploader

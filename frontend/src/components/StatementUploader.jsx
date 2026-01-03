import { useState } from 'react'
import './StatementUploader.css'

const StatementUploader = ({ onImport }) => {
  const [broker, setBroker] = useState('Angel One')
  const [statementDate, setStatementDate] = useState(() => new Date().toISOString().split('T')[0])
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [skipped, setSkipped] = useState([])

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
    <div className="statement-uploader">
      <div className="statement-uploader__intro">
        <h3>Upload statement</h3>
        <p>
          Drop your Angel One / Groww holdings XLSX/CSV, we’ll auto-merge schemes without duplicates.
        </p>
      </div>
      <div className="statement-uploader__grid">
        <div className="statement-uploader__field">
          <label>Broker</label>
          <select value={broker} onChange={(event) => setBroker(event.target.value)}>
            <option value="Angel One">Angel One</option>
            <option value="Groww">Groww</option>
            <option value="External">External</option>
          </select>
        </div>
        <div className="statement-uploader__field">
          <label>Statement date</label>
          <input type="date" value={statementDate} onChange={(event) => setStatementDate(event.target.value)} />
        </div>
      </div>
      <label className="statement-uploader__dropzone">
        <input type="file" accept=".csv,.xls,.xlsx" className="statement-uploader__file-input" onChange={handleFileChange} />
        {file ? <span className="statement-uploader__file-name">{file.name}</span> : <span>Drop CSV/XLSX or click to browse</span>}
      </label>
      {loading && (
        <div className="statement-uploader__progress">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="statement-uploader__error">{error}</p>}
      {skipped.length > 0 && (
        <div className="statement-uploader__skipped">
          {skipped.map((row) => (
            <p key={`${row.schemeName}-${row.message}`}>
              {row.schemeName}: {row.message}
            </p>
          ))}
        </div>
      )}
      {status && !error && <p className="statement-uploader__status">{status}</p>}
      <button
        type="button"
        className="statement-uploader__submit btn-primary"
        onClick={handleImport}
        disabled={!file || loading}
      >
        {loading ? 'Importing...' : 'Import holdings'}
      </button>
    </div>
  )}

export default StatementUploader

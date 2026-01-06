import { useMemo, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { ShieldCheck, FileText, FolderLock, Lock, UploadCloud, ArrowRight } from 'lucide-react'

const DOCUMENT_TYPES = [
  { label: 'Mutual fund CAS', description: 'Monthly CAS for SIP + lumpsum holdings', icon: FileText },
  { label: 'Bank statements', description: 'Verified PDF statements for income tagging', icon: UploadCloud },
  { label: 'KYC artefacts', description: 'PAN, Aadhaar, address proof and CKYC details', icon: ShieldCheck },
  { label: 'Insurance policies', description: 'Life, health & ULIP schedules', icon: FolderLock },
]

const Documents = () => {
  const { integrations } = useSettings()
  const [isConnecting, setIsConnecting] = useState(false)
  const digilocker = integrations?.digilocker ?? {}
  const hasKeys = Boolean(digilocker.clientId && digilocker.clientSecret)

  const connectionStatus = useMemo(() => {
    if (!hasKeys) {
      return {
        tone: 'text-amber-500',
        message: 'Add Digilocker API keys in Settings to enable document sync.',
      }
    }
    return {
      tone: 'text-emerald-500',
      message: 'Keys detected. Initiate Digilocker login to fetch secure documents.',
    }
  }, [hasKeys])

  const handleConnect = async () => {
    setIsConnecting(true)
    // Placeholder for OAuth kickoff; future implementation should redirect to Digilocker auth.
    setTimeout(() => {
      setIsConnecting(false)
      alert('Digilocker login flow will start here once OAuth is configured.')
    }, 600)
  }

  return (
    <div className="page-stack">
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Documents</p>
            <h2 className="text-3xl font-display text-slate-900">Digilocker vault</h2>
            <p className={`text-sm ${connectionStatus.tone}`}>{connectionStatus.message}</p>
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Lock className="h-4 w-4" />
            {isConnecting ? 'Preparing...' : 'Login with Digilocker'}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENT_TYPES.map((item) => (
            <div
              key={item.label}
              className="border border-borderLight rounded-2xl p-4 flex items-start gap-3 bg-surfaceMuted/70"
            >
              <item.icon className="h-5 w-5 text-slate-500 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm">
            We request read-only scopes from Digilocker. Documents stay encrypted in transit and
            rest. Once fetched, they’ll populate the vault below.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-borderLight p-6 text-center text-slate-500">
          <p className="font-semibold text-slate-700">No documents synced yet</p>
          <p className="text-sm">
            After you login with Digilocker, verified PDFs will appear here for quick viewing and
            auto-classification.
          </p>
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <h3 className="text-xl font-display">How sync will work</h3>
        <div className="grid lg:grid-cols-3 gap-3 text-sm text-slate-600">
          {[
            {
              title: 'Authenticate',
              detail:
                'Use the Digilocker consent screen. We only request documents listed above with read access.',
            },
            {
              title: 'Fetch & classify',
              detail:
                'Documents are tagged (CAS, bank, KYC) and routed to the right module: mutual funds, expenses, or onboarding.',
            },
            {
              title: 'Insights unlocked',
              detail:
                'Updated CAS feeds charts such as Net Worth, Trend Area, and generates compliance reminders automatically.',
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-borderLight p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-surfaceMuted flex items-center justify-center text-sm font-semibold text-accentBlue">
                  {index + 1}
                </span>
                <p className="font-semibold text-slate-900">{step.title}</p>
              </div>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ArrowRight className="h-4 w-4" />
          <p>
            Need to add API keys? Head to <span className="font-semibold">Settings → Digilocker</span> and fill in the
            values Render/.env uses.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Documents

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getCreatorByUserId } from '../../services/creatorService'
import { getPixelPactByCreator } from '../../services/campaignService'
import { formatINR } from '../../lib/format'
import type { PixelPactRow } from '../../types/database'

const ease = [0.16, 1, 0.3, 1] as const

const STATUS_ICON = {
  verified: { icon: '✓', bg: 'rgba(187,247,208,0.15)', border: 'rgba(134,239,172,0.4)', text: 'text-emerald-400' },
  failed:   { icon: '✗', bg: 'rgba(254,202,202,0.1)',  border: 'rgba(252,165,165,0.3)',  text: 'text-red-400' },
  pending:  { icon: '…', bg: 'rgba(245,166,83,0.1)',   border: 'rgba(245,166,83,0.3)',   text: 'text-ember-400' },
  partial:  { icon: '⚬', bg: 'rgba(245,179,66,0.1)',   border: 'rgba(245,179,66,0.3)',   text: 'text-amber-400' },
}

export default function PixelPactPage() {
  const { user } = useAuth()
  const [verifications, setVerifications] = useState<PixelPactRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      const creator = await getCreatorByUserId(user!.id)
      if (!creator || cancelled) { setLoading(false); return }
      const data = await getPixelPactByCreator(creator.id)
      if (!cancelled) { setVerifications(data); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="label-caps text-ember-400/60">06 — Pixel Pact</span>
          <span
            className="label-caps px-2 py-0.5 rounded-full text-amber-400/70"
            style={{ background: 'rgba(245,179,66,0.1)', fontSize: 9 }}
          >
            Beta
          </span>
        </div>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Smart deliverables that verify themselves.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          AI verification checks every deliverable against the brand brief the moment you upload.
          Payment releases automatically when the work passes.
        </p>
      </motion.div>

      <div className="space-y-4 mb-6">
        {loading && (
          <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center">
            <span className="font-sans text-[14px] text-white/25">Loading contracts…</span>
          </div>
        )}

        {!loading && verifications.length === 0 && (
          <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center">
            <span className="font-sans text-[14px] text-white/25">No Pixel Pact contracts yet.</span>
          </div>
        )}

        {verifications.map((v, ci) => {
          const pct = v.payment_amount > 0 && v.status === 'verified' ? 100 : v.status === 'partial' ? 60 : 0
          const si = STATUS_ICON[v.status] ?? STATUS_ICON.pending

          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: ci * 0.08, ease }}
              className="rounded-2xl overflow-hidden border border-studio-brd"
              style={{ background: '#0F0E0B' }}
            >
              <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
                <div>
                  <div className="font-sans text-[13px] font-semibold text-white/80">
                    Pixel Pact Contract
                  </div>
                  <div className="label-caps text-white/25 mt-0.5">Campaign verification</div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border flex items-center justify-center"
                    style={{ background: si.bg, borderColor: si.border }}
                  >
                    <span className={`${si.text} text-[10px]`}>{si.icon}</span>
                  </div>
                  <span className="font-sans text-[11px] text-white/35 capitalize">{v.status}</span>
                </div>
              </div>

              <div className="mx-5 my-5 rounded-xl p-4 border border-studio-brd/50" style={{ background: 'rgba(28,26,23,0.3)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="label-caps text-white/25">Payment</span>
                  <span className="font-sans text-[13px] font-semibold text-white/70">
                    {formatINR(Number(v.payment_amount))}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#2A2722' }}>
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {v.status === 'verified' && (
                  <div className="font-sans text-[11px] text-emerald-400/60 mt-2">
                    ✓ Verified — payment complete
                  </div>
                )}
                {v.status === 'pending' && (
                  <div className="font-sans text-[11px] text-white/25 mt-2">
                    Verification in progress…
                  </div>
                )}
                {v.status === 'failed' && (
                  <div className="font-sans text-[11px] text-red-400/60 mt-2">
                    Deliverable check failed — review required
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: '⚡', text: 'Instant AI verification on upload' },
          { icon: '◈', text: 'Automated payment on verified deliverables' },
          { icon: '⬢', text: 'Smart contracts — both parties protected' },
          { icon: '↗', text: 'Objective, auditable approval record' },
        ].map((f) => (
          <div
            key={f.text}
            className="flex items-start gap-3 rounded-xl p-4 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <span className="text-base shrink-0 text-ember-400/60">{f.icon}</span>
            <span className="font-sans text-[12px] text-white/45 leading-relaxed">{f.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

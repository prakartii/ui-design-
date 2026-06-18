import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCampaigns } from '../../hooks/useCampaigns'
import { formatINR } from '../../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

const STATUS_STYLES = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-400/70', label: 'Active' },
  draft: { dot: 'bg-white/20', text: 'text-white/30', label: 'Draft' },
  completed: { dot: 'bg-white/30', text: 'text-white/40', label: 'Completed' },
  paused: { dot: 'bg-amber-400', text: 'text-amber-400/70', label: 'Paused' },
}

const FILTERS = ['All', 'Active', 'Draft', 'Completed'] as const

export default function CampaignsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const { campaigns, loading } = useCampaigns()

  const filtered =
    filter === 'All' ? campaigns : campaigns.filter((c) => c.status === filter.toLowerCase())

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">Brand Portal</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Campaigns
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Manage your creator campaigns, track budgets, and monitor performance.
        </p>
      </motion.div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-sans text-[12px] font-medium px-4 py-2 rounded-lg border transition-all duration-150 ${
                filter === f
                  ? 'bg-ember-600 border-ember-600 text-white'
                  : 'border-studio-brd text-white/40 hover:text-white/70'
              }`}
              style={filter !== f ? { background: '#141210' } : {}}
            >
              {f}
              <span className="ml-1.5 text-[10px] opacity-60">
                {f === 'All'
                  ? campaigns.length
                  : campaigns.filter((c) => c.status === f.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>
        <button className="font-sans text-[12px] font-medium px-4 py-2 rounded-lg bg-ember-600 hover:bg-ember-800 text-white transition-colors duration-200">
          + New campaign
        </button>
      </div>

      <div className="space-y-4">
        {loading && (
          <div
            className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center"
          >
            <span className="font-sans text-[14px] text-white/25">Loading campaigns…</span>
          </div>
        )}

        {filtered.map((c, i) => {
          const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.draft

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease }}
              className="rounded-2xl p-6 border border-studio-brd"
              style={{ background: '#141210' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-sans text-[15px] font-semibold text-white/85">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className={`font-sans text-[12px] ${st.text}`}>{st.label}</span>
                    {c.deadline && (
                      <>
                        <span className="text-white/15">·</span>
                        <span className="font-sans text-[12px] text-white/30">
                          Due{' '}
                          {new Date(c.deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <div className="label-caps text-white/20 mb-1">Budget</div>
                  <div className="font-sans text-[14px] font-medium text-white/70">
                    {formatINR(Number(c.budget))}
                  </div>
                </div>
                <div>
                  <div className="label-caps text-white/20 mb-1">Currency</div>
                  <div className="font-sans text-[14px] font-medium text-white/70">{c.currency}</div>
                </div>
                <div>
                  <div className="label-caps text-white/20 mb-1">Status</div>
                  <div className={`font-sans text-[14px] font-medium ${st.text}`}>{st.label}</div>
                </div>
              </div>
            </motion.div>
          )
        })}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center">
            <div className="font-sans text-[14px] text-white/25 mb-1">No campaigns found</div>
            <div className="font-sans text-[12px] text-white/15">
              Try a different filter or create a new campaign
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

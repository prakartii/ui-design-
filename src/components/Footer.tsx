const columns = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'API', 'Integrations'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    heading: 'Creators',
    links: ['How it works', 'Brand profiles', 'Brief translator', 'Review studio', 'Match studio'],
  },
  {
    heading: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-0 px-6 md:px-10 py-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif text-base font-normal tracking-widest3 text-ink-primary">
              INTENT
            </span>
            <p className="mt-3 font-sans text-sm text-ink-tertiary leading-[1.8] max-w-[200px]">
              Understand what brands mean.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {['Twitter', 'LinkedIn'].map(s => (
                <a
                  key={s}
                  href="#"
                  className="font-sans text-xs text-ink-tertiary hover:text-ink-primary transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h3 className="font-sans text-xs font-semibold text-ink-primary tracking-wider uppercase mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-sans text-sm text-ink-tertiary hover:text-ink-primary transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-sans text-xs text-ink-tertiary">
            © 2026 Intent. All rights reserved.
          </p>
          <p className="font-sans text-xs text-ink-tertiary">
            Built for creators who take their craft seriously.
          </p>
        </div>
      </div>
    </footer>
  )
}

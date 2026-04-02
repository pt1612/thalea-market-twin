export default function Footer() {
  return (
    <footer className="bg-white border-t border-mint-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-forest/70">Thalea Market Twin</p>
          <p className="text-xs text-forest/30 mt-0.5">© 2024 Thalea Digital Atelier. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'Methodology'].map((link) => (
            <button key={link} className="text-xs text-forest/40 hover:text-forest/70 transition-colors">
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}

interface NavbarProps {
  currentStep: number
  maxStep: number
  stepLabels: readonly string[]
  onNavigate: (step: number) => void
}

export default function Navbar({ currentStep, maxStep, stepLabels, onNavigate }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-mint-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate(1)}
          className="text-forest font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          Thalea Market Twin
        </button>

        {/* Step nav */}
        <div className="flex items-center gap-8">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1
            const isActive = stepNum === currentStep
            const isReachable = stepNum <= maxStep
            return (
              <button
                key={label}
                onClick={() => isReachable && onNavigate(stepNum)}
                disabled={!isReachable}
                className={`relative text-sm pb-0.5 font-medium transition-all ${
                  isActive
                    ? 'text-forest font-semibold'
                    : isReachable
                    ? 'text-forest/50 hover:text-forest/80'
                    : 'text-forest/25 cursor-not-allowed'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* User icon */}
        <button className="w-8 h-8 rounded-full border border-forest/20 flex items-center justify-center hover:border-forest/40 transition-colors">
          <svg className="w-4 h-4 text-forest/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </button>
      </div>
    </nav>
  )
}

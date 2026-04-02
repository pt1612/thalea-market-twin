interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { number: 1, label: 'Project' },
  { number: 2, label: 'Twins' },
  { number: 3, label: 'Interview' },
  { number: 4, label: 'Report' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                step.number < currentStep
                  ? 'bg-gray-900 text-white'
                  : step.number === currentStep
                  ? 'bg-black text-white ring-4 ring-gray-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium ${
                step.number === currentStep
                  ? 'text-gray-900'
                  : step.number < currentStep
                  ? 'text-gray-500'
                  : 'text-gray-300'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-px mx-2 mb-5 transition-all duration-300 ${
                step.number < currentStep ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

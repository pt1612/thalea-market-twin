'use client'

import { useState } from 'react'
import StepIndicator from '@/components/StepIndicator'
import ProjectForm from '@/components/ProjectForm'
import TwinProfiles from '@/components/TwinProfiles'
import InterviewChat from '@/components/InterviewChat'
import FinalReport from '@/components/FinalReport'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'

export default function Home() {
  const [step, setStep] = useState(1)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [twins, setTwins] = useState<DigitalTwin[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const handleProjectSubmit = (info: ProjectInfo) => {
    setProjectInfo(info)
    setStep(2)
  }

  const handleStartInterview = (generatedTwins: DigitalTwin[]) => {
    setTwins(generatedTwins)
    setStep(3)
  }

  const handleGenerateReport = (conversationMessages: Message[]) => {
    setMessages(conversationMessages)
    setStep(4)
  }

  const handleStartOver = () => {
    setStep(1)
    setProjectInfo(null)
    setTwins([])
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-black" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Thalea</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Market Twin
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Validate your startup idea with AI-powered Digital Twins — before talking to real customers.
          </p>
        </header>

        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Step content */}
        <div className="mt-10 sm:mt-14">
          {step === 1 && <ProjectForm onSubmit={handleProjectSubmit} />}

          {step === 2 && projectInfo && (
            <TwinProfiles projectInfo={projectInfo} onContinue={handleStartInterview} />
          )}

          {step === 3 && projectInfo && twins.length > 0 && (
            <InterviewChat
              projectInfo={projectInfo}
              twins={twins}
              onGenerateReport={handleGenerateReport}
            />
          )}

          {step === 4 && projectInfo && (
            <FinalReport
              projectInfo={projectInfo}
              twins={twins}
              messages={messages}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  )
}

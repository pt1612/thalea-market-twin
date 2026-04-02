'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProjectForm from '@/components/ProjectForm'
import TwinProfiles from '@/components/TwinProfiles'
import InterviewChat from '@/components/InterviewChat'
import FinalReport from '@/components/FinalReport'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'

const STEP_NAMES = ['Project', 'Twins', 'Interview', 'Analysis'] as const

export default function Home() {
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [twins, setTwins] = useState<DigitalTwin[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const goToStep = (s: number) => {
    if (s >= 1 && s <= maxStep) setStep(s)
  }

  const advanceTo = (s: number) => {
    setStep(s)
    if (s > maxStep) setMaxStep(s)
  }

  const handleProjectSubmit = (info: ProjectInfo) => {
    setProjectInfo(info)
    // Reset downstream state when project changes
    setTwins([])
    setMessages([])
    setMaxStep((prev) => Math.max(prev, 2))
    advanceTo(2)
  }

  const handleStartInterview = (generatedTwins: DigitalTwin[]) => {
    setTwins(generatedTwins)
    setMessages([])
    advanceTo(3)
  }

  const handleGenerateReport = (conversationMessages: Message[]) => {
    setMessages(conversationMessages)
    advanceTo(4)
  }

  const handleStartOver = () => {
    setStep(1)
    setMaxStep(1)
    setProjectInfo(null)
    setTwins([])
    setMessages([])
  }

  const stepLabels = STEP_NAMES

  return (
    <div className="min-h-screen bg-mint flex flex-col">
      <Navbar
        currentStep={step}
        maxStep={maxStep}
        stepLabels={stepLabels}
        onNavigate={goToStep}
      />
      <main className="flex-1">
        {step === 1 && (
          <ProjectForm
            initialValues={projectInfo}
            onSubmit={handleProjectSubmit}
          />
        )}
        {step === 2 && projectInfo && (
          <TwinProfiles
            projectInfo={projectInfo}
            initialTwins={twins.length > 0 ? twins : null}
            onContinue={handleStartInterview}
            onBack={() => goToStep(1)}
          />
        )}
        {step === 3 && projectInfo && twins.length > 0 && (
          <InterviewChat
            projectInfo={projectInfo}
            twins={twins}
            initialMessages={messages}
            onGenerateReport={handleGenerateReport}
          />
        )}
        {step === 4 && projectInfo && (
          <FinalReport
            projectInfo={projectInfo}
            twins={twins}
            messages={messages}
            onStartOver={handleStartOver}
            onBack={() => goToStep(3)}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

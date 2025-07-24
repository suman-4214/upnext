import { getAssessments } from '@/actions/interview';
import React from 'react'
import StatsCards from './_components/stats-cards';
import PerformanceCharts from './_components/performance-charts';
import QuizList from './_components/quiz-list';

const InterviewPage = async() => {
  const assessments = await getAssessments();
  return (
    <div>
      <h1 className='text-6xl font-bold gradient-title mb-5'>
        Interview Preparation
      </h1>

      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceCharts assessments={assessments} />
        <QuizList assessments={assessments} />

      </div>
    </div>
  )
}

export default InterviewPage
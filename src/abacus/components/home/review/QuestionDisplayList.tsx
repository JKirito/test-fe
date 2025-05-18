// src/abacus/components/home/review/QuestionDisplayList.tsx
import React from 'react';
import { Question } from './types';
import './QuestionDisplayList.scss'; // Import SCSS

interface QuestionDisplayListProps {
  title: string;
  questions: Question[];
}

const QuestionDisplayList: React.FC<QuestionDisplayListProps> = ({ title, questions }) => (
  <div className="questionList">
    <h3 className="questionList__title">{title}</h3>
    <div className="questionList__list">
      {questions.map((question, index) => (
        <div key={`question-${title}-${index}`} className="questionList__item">
          <span className="questionList__question">{question.question}</span>
          <span className="questionList__answer">{question.answer || 'Not answered'}</span>
        </div>
      ))}
      {questions.length === 0 && <div className="questionList__empty">No questions available.</div>}
    </div>
  </div>
);

export default QuestionDisplayList;

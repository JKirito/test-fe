import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import Button from '@/einstein/components/common/Button';
import { IExpert } from '../../types';
import styles from './NodeExpertsForm.module.scss';

interface NodeExpertsFormProps {
  experts: IExpert[];
  onExpertsChange: (experts: IExpert[]) => void;
}

const NodeExpertsForm: React.FC<NodeExpertsFormProps> = ({ experts, onExpertsChange }) => {
  const [newExpert, setNewExpert] = useState<IExpert>({ name: '', email: '', title: '' });

  const handleExpertChange = (index: number, field: keyof IExpert, value: string) => {
    const updatedExperts = [...experts];
    updatedExperts[index] = { ...updatedExperts[index], [field]: value };
    onExpertsChange(updatedExperts);
  };

  const handleNewExpertChange = (field: keyof IExpert, value: string) => {
    setNewExpert((prev) => ({ ...prev, [field]: value }));
  };

  const addExpert = () => {
    if (newExpert.name) {
      onExpertsChange([...experts, newExpert]);
      setNewExpert({ name: '', email: '', title: '' });
    }
  };

  const removeExpert = (index: number) => {
    onExpertsChange(experts.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.expertsForm}>
      <h3 className={styles.expertsForm__title}>Experts</h3>

      {experts.length > 0 ? (
        <div className={styles.expertsForm__list}>
          {experts.map((expert, index) => (
            <div key={index} className={styles.expertsForm__item}>
              <div className={styles.expertsForm__avatar}>
                {expert.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className={styles.expertsForm__details}>
                <div className={styles.expertsForm__formGroup}>
                  <input
                    type="text"
                    value={expert.name}
                    onChange={(e) => handleExpertChange(index, 'name', e.target.value)}
                    className={styles.expertsForm__input}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className={styles.expertsForm__formGroup}>
                  <input
                    type="email"
                    value={expert.email}
                    onChange={(e) => handleExpertChange(index, 'email', e.target.value)}
                    className={styles.expertsForm__input}
                    placeholder="Email (optional)"
                  />
                </div>
                <div className={styles.expertsForm__formGroup}>
                  <input
                    type="text"
                    value={expert.title}
                    onChange={(e) => handleExpertChange(index, 'title', e.target.value)}
                    className={styles.expertsForm__input}
                    placeholder="Title (optional)"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExpert(index)}
                className={styles.expertsForm__removeBtn}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.expertsForm__emptyMessage}>No experts added yet.</p>
      )}

      <div className={styles.expertsForm__addExpert}>
        <div className={styles.expertsForm__formGroup}>
          <input
            type="text"
            value={newExpert.name}
            onChange={(e) => handleNewExpertChange('name', e.target.value)}
            className={styles.expertsForm__input}
            placeholder="Name"
            required
          />
        </div>
        <div className={styles.expertsForm__formGroup}>
          <input
            type="email"
            value={newExpert.email}
            onChange={(e) => handleNewExpertChange('email', e.target.value)}
            className={styles.expertsForm__input}
            placeholder="Email (optional)"
          />
        </div>
        <div className={styles.expertsForm__formGroup}>
          <input
            type="text"
            value={newExpert.title}
            onChange={(e) => handleNewExpertChange('title', e.target.value)}
            className={styles.expertsForm__input}
            placeholder="Title (optional)"
          />
        </div>
        <Button
          variant="primary"
          onClick={addExpert}
          text="Add Expert"
          textClassName="text-white"
          icon={<User size={16} />}
          disabled={!newExpert.name.trim()}
        />
      </div>
    </div>
  );
};

export default NodeExpertsForm;

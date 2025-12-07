import React from 'react';
import './ContextPanel.css';

interface ContextPanelProps {
  value: string;
  onChange: (text: string) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ value, onChange }) => {
  return (
    <div className="context-panel">
      <div className="context-panel-header">
        <label htmlFor="context-textarea" className="context-label">
          Context (Optional)
        </label>
      </div>
      <textarea
        id="context-textarea"
        className="context-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional: Add context (e.g., formal, casual, business, etc.)"
        aria-label="Context input"
      />
    </div>
  );
};
